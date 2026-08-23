"""
Match router — the core AI endpoint.
POST /match/score   → takes a job + list of freelancer profiles → returns ranked scores
"""
from fastapi import APIRouter, HTTPException
from typing import List
import numpy as np

from app.models.schemas import MatchRequest, MatchResponse, MatchResult
from app.services.embedding import EmbeddingService
from app.services.cache import get_or_compute_embeddings

router = APIRouter()


@router.post("/score", response_model=MatchResponse, summary="Rank freelancers for a job by semantic similarity")
async def score_match(payload: MatchRequest):
    """
    Takes a job description and a list of freelancer profiles.
    Returns each freelancer ranked by their semantic similarity score (0–1).

    Algorithm:
    1. Build a rich text representation of the job (description + skills)
    2. Build a rich text representation of each freelancer (bio + skills + level)
    3. Encode all texts to L2-normalised embeddings via all-MiniLM-L6-v2
    4. Compute cosine similarity between job embedding and each profile embedding
    5. Apply experience-level bonus (+0.05 if exact match) for ranking adjustment
    6. Return sorted results with rank, freelancer_id, and score
    """
    if not payload.freelancers:
        raise HTTPException(status_code=400, detail="At least one freelancer profile is required")

    embedding_svc = EmbeddingService.get_instance()

    # Build text representations
    job_text = embedding_svc.build_job_text(payload.job_description, payload.skills_required)

    profile_texts = [
        embedding_svc.build_profile_text(f.bio, f.skills, f.experience_level or "intermediate")
        for f in payload.freelancers
    ]

    # Encode job + all profiles (cache-aware: cache hits skip model inference)
    all_texts = [job_text] + profile_texts
    all_embeddings = await get_or_compute_embeddings(all_texts, embedding_svc)

    job_embedding: np.ndarray = all_embeddings[0]
    profile_embeddings: List[np.ndarray] = all_embeddings[1:]

    # Compute scores
    raw_results = []
    for i, freelancer in enumerate(payload.freelancers):
        base_score = embedding_svc.cosine_similarity(job_embedding, profile_embeddings[i])

        # Experience level bonus (encourages proper matching)
        bonus = 0.0
        if payload.experience_level and freelancer.experience_level:
            if freelancer.experience_level == payload.experience_level:
                bonus = 0.05

        final_score = min(1.0, base_score + bonus)
        raw_results.append((freelancer.freelancer_id, final_score))

    # Sort descending by score
    raw_results.sort(key=lambda x: x[1], reverse=True)

    results = [
        MatchResult(freelancer_id=fid, score=round(score, 4), rank=rank + 1)
        for rank, (fid, score) in enumerate(raw_results)
    ]

    return MatchResponse(
        job_id=payload.job_id,
        results=results,
        model_used=embedding_svc._model.get_sentence_embedding_dimension.__module__ or "all-MiniLM-L6-v2",
        total_candidates=len(results),
    )


@router.post("/score/batch", response_model=List[MatchResponse], summary="Batch match for multiple jobs")
async def score_match_batch(payloads: List[MatchRequest]):
    """Process multiple job-freelancer match requests in a single API call."""
    if len(payloads) > 20:
        raise HTTPException(status_code=400, detail="Batch size cannot exceed 20 jobs")

    responses = []
    for payload in payloads:
        result = await score_match(payload)
        responses.append(result)
    return responses
