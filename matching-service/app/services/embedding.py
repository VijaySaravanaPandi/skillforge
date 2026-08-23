"""
EmbeddingService — wraps sentence-transformers to produce text embeddings
and compute cosine similarity scores.

Model used: all-MiniLM-L6-v2
- 384-dimensional dense vectors
- ~80MB on disk
- Excellent speed/quality trade-off for semantic similarity tasks
"""
from typing import List
import numpy as np
from sentence_transformers import SentenceTransformer

from app.config import get_settings

settings = get_settings()


class EmbeddingService:
    _instance: "EmbeddingService" = None

    def __init__(self):
        print(f"[EmbeddingService] Loading model: {settings.model_name}")
        self._model = SentenceTransformer(settings.model_name)
        print("[EmbeddingService] Model loaded ✓")

    @classmethod
    def get_instance(cls) -> "EmbeddingService":
        """Singleton accessor — model is loaded only once per process."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def encode(self, texts: List[str]) -> np.ndarray:
        """
        Encode a list of text strings into L2-normalised embedding vectors.
        Returns shape: (len(texts), embedding_dim)
        """
        embeddings = self._model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
        return embeddings

    @staticmethod
    def cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
        """
        Cosine similarity between two L2-normalised vectors.
        Since vectors are pre-normalised, this is just the dot product.
        Returns a value in [0, 1] for normalised vectors.
        """
        similarity = float(np.dot(vec_a, vec_b))
        # Clamp to [0, 1] to avoid floating-point drift
        return max(0.0, min(1.0, similarity))

    def build_job_text(self, job_description: str, skills_required: List[str]) -> str:
        """
        Concatenate job description with skills into a single text string
        for embedding. Skills are repeated to give them more weight.
        """
        skills_str = ", ".join(skills_required)
        return f"{job_description}\n\nRequired skills: {skills_str}\nSkills: {skills_str}"

    def build_profile_text(self, bio: str, skills: List[str], experience_level: str) -> str:
        """
        Concatenate freelancer bio with skills and experience level
        for a rich embedding representation.
        """
        skills_str = ", ".join(skills)
        return f"{bio}\n\nSkills: {skills_str}\nExperience: {experience_level}"
