"""
/classify — second-layer crisis risk scoring.

This sits BEHIND the existing keyword scan in src/utils/crisisDetection.ts,
not instead of it. Recommended flow on the frontend:

  1. Run the fast keyword scan locally (instant, no network call).
  2. ALSO call this endpoint in parallel on every user message, regardless
     of what the keyword scan says — indirect phrasing ("I don't feel like
     waking up tomorrow") won't trip keywords but can still register real
     concern probability here.

Confirmed via manual testing on this model:
  LABEL_0 = non-concerning
  LABEL_1 = concerning / suicide-risk

Never rely on this model alone, and never rely on the keyword scan alone —
they cover each other's blind spots.
"""
from functools import lru_cache

from fastapi import APIRouter
from pydantic import BaseModel, Field
from transformers import pipeline

from app.config import CLASSIFIER_AMBIGUOUS_THRESHOLD, CLASSIFIER_MODEL_ID, CLASSIFIER_RISK_THRESHOLD, DEVICE

router = APIRouter()


class ClassifyRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=4000)


class ClassifyResponse(BaseModel):
    label: str
    score: float
    concern_score: float  # raw probability of the concerning class, always present
    risk_level: str  # "low" | "ambiguous" | "high"
    threshold: float


@lru_cache(maxsize=1)
def get_classifier():
    """
    Loaded once, lazily, and cached for the life of the process — model
    load is the slow part (a few seconds), inference itself is fast.
    """
    device_index = 0 if DEVICE == "cuda" else -1
    return pipeline(
        "sentiment-analysis",
        model=CLASSIFIER_MODEL_ID,
        device=device_index,
        top_k=None,  # return scores for BOTH classes, not just the winner
    )


@router.post("/classify", response_model=ClassifyResponse)
def classify(req: ClassifyRequest) -> ClassifyResponse:
    classifier = get_classifier()
    # top_k=None returns a list like:
    # [{'label': 'LABEL_0', 'score': 0.81}, {'label': 'LABEL_1', 'score': 0.19}]
    all_scores = classifier(req.text)[0]
    scores_by_label = {r["label"]: float(r["score"]) for r in all_scores}

    concern_score = scores_by_label.get("LABEL_1", 0.0)
    top_label = max(scores_by_label, key=scores_by_label.get)
    top_score = scores_by_label[top_label]

    # Two thresholds, not one:
    #   - HIGH: model is confident this is concerning -> flag immediately
    #   - AMBIGUOUS: concern probability isn't dominant but isn't negligible
    #     either -> this is exactly the indirect-phrasing case that a
    #     single top-label check misses. Flag these too, and let the Qwen
    #     LLM layer make the final call.
    if concern_score >= CLASSIFIER_RISK_THRESHOLD:
        risk_level = "high"
    elif concern_score >= CLASSIFIER_AMBIGUOUS_THRESHOLD:
        risk_level = "ambiguous"
    else:
        risk_level = "low"

    return ClassifyResponse(
        label=top_label,
        score=top_score,
        concern_score=concern_score,
        risk_level=risk_level,
        threshold=CLASSIFIER_RISK_THRESHOLD,
    )
