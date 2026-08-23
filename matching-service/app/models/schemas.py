from pydantic import BaseModel, Field
from typing import List, Optional


class FreelancerProfile(BaseModel):
    """Incoming freelancer profile for matching."""
    freelancer_id: str = Field(..., description="Unique freelancer user ID")
    bio: str = Field(default="", description="Freelancer bio / description")
    skills: List[str] = Field(default=[], description="List of skills the freelancer has")
    experience_level: Optional[str] = Field(default="intermediate", description="entry | intermediate | expert")
    hourly_rate: Optional[float] = Field(default=0.0)


class MatchRequest(BaseModel):
    """Request payload for the /match endpoint."""
    job_id: str = Field(..., description="The job ID being matched")
    job_description: str = Field(..., description="Full job description text")
    skills_required: List[str] = Field(default=[], description="Skills the job requires")
    experience_level: Optional[str] = Field(default=None)
    freelancers: List[FreelancerProfile] = Field(..., description="List of freelancer profiles to rank")


class MatchResult(BaseModel):
    """Single freelancer match result."""
    freelancer_id: str
    score: float = Field(..., ge=0.0, le=1.0, description="Cosine similarity score 0–1")
    rank: int


class MatchResponse(BaseModel):
    """Response from the /match endpoint."""
    job_id: str
    results: List[MatchResult]
    model_used: str
    total_candidates: int
