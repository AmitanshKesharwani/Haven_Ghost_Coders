"""
/classify — second-layer crisis risk scoring.

This sits BEHIND the existing keyword scan in src/utils/crisisDetection.ts,
not instead of it. Recommended flow on the frontend:

  1. Run the fast keyword scan locally (instant, no network call).
  2. If the keyword scan flags anything (even low confidence), call this
     endpoint with the last few user messages for a model-based second
     opinion before deciding whether to show the crisis overlay.

Never rely on this model alone, and never rely on the keyword scan alone —
they cover each other's blind spots (keywords catch explicit language the
model might soften past; the model catches indirect/contextual language
keywords miss entirely).
"""
from functools import lru_cache

from fastapi import APIRouter
from pydantic import BaseModel, Field
from transformers import pipeline

from app.config import CLASSIFIER_MODEL_ID, CLASSIFIER_RISK_THRESHOLD, DEVICE

router = APIRouter()


class ClassifyRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=4000)


class ClassifyResponse(BaseModel):
    label: str
    score: float
    risk_level: str  # "low" | "high"
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
    )


@router.post("/classify", response_model=ClassifyResponse)
def classify(req: ClassifyRequest) -> ClassifyResponse:
    classifier = get_classifier()
    result = classifier(req.text)[0]  # {'label': ..., 'score': ...}

    label = result["label"]
    score = float(result["score"])

    # NOTE: confirm sentinet/suicidality's actual label names before relying
    # on this in production — swap "SUICIDE"/"suicidal" below for whatever
    # the model's config.json id2label actually reports. Log a few real
    # outputs during testing and adjust.
    is_flagged_label = label.lower() in {"label_1"}
    risk_level = "high" if (is_flagged_label and score >= CLASSIFIER_RISK_THRESHOLD) else "low"

    return ClassifyResponse(
        label=label,
        score=score,
        risk_level=risk_level,
        threshold=CLASSIFIER_RISK_THRESHOLD,
    )
