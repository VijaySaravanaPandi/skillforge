"""
EmbeddingCacheService — persists computed embeddings in MongoDB to avoid
redundant model inference on repeated requests for the same text.

Cache key: SHA-256 hash of the input text string.
TTL: embeddings older than 7 days are considered stale and re-computed.
"""
import hashlib
import time
from typing import Optional, List
import numpy as np

from app.database import get_db

CACHE_COLLECTION = "embedding_cache"
CACHE_TTL_SECONDS = 7 * 24 * 3600  # 7 days


def _hash_text(text: str) -> str:
    """SHA-256 hash of the input text — used as the cache key."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


async def get_cached_embedding(text: str) -> Optional[np.ndarray]:
    """
    Look up a cached embedding by text hash.
    Returns None if cache miss or entry is stale.
    """
    db = get_db()
    if db is None:
        return None

    key = _hash_text(text)
    doc = await db[CACHE_COLLECTION].find_one({"_id": key})

    if doc is None:
        return None

    # Check TTL
    age = time.time() - doc.get("created_at", 0)
    if age > CACHE_TTL_SECONDS:
        await db[CACHE_COLLECTION].delete_one({"_id": key})
        return None

    return np.array(doc["embedding"], dtype=np.float32)


async def cache_embedding(text: str, embedding: np.ndarray) -> None:
    """Store an embedding in MongoDB with a timestamp for TTL."""
    db = get_db()
    if db is None:
        return

    key = _hash_text(text)
    await db[CACHE_COLLECTION].replace_one(
        {"_id": key},
        {
            "_id": key,
            "text_preview": text[:200],  # for debugging
            "embedding": embedding.tolist(),
            "created_at": time.time(),
        },
        upsert=True,
    )


async def get_or_compute_embeddings(
    texts: List[str], embedding_svc
) -> np.ndarray:
    """
    For each text, try to load from cache. Compute only cache misses in batch.
    Returns a 2D numpy array of shape (len(texts), embedding_dim).
    """
    results: List[Optional[np.ndarray]] = [None] * len(texts)
    miss_indices: List[int] = []
    miss_texts: List[str] = []

    # Phase 1: cache lookup
    for i, text in enumerate(texts):
        cached = await get_cached_embedding(text)
        if cached is not None:
            results[i] = cached
        else:
            miss_indices.append(i)
            miss_texts.append(text)

    # Phase 2: batch-encode cache misses
    if miss_texts:
        new_embeddings = embedding_svc.encode(miss_texts)
        for idx, (text, emb) in zip(miss_indices, zip(miss_texts, new_embeddings)):
            results[idx] = emb
            await cache_embedding(text, emb)

    return np.stack(results)
