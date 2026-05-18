from unittest.mock import patch

from app import create_app
from services.groq_client import GroqClient


def test_health():
    app = create_app()
    c = app.test_client()
    assert c.get("/health").status_code == 200


def test_describe_requires_text():
    app = create_app()
    c = app.test_client()
    assert c.post("/describe", json={}).status_code == 400


def test_describe_invalid_json():
    app = create_app()
    c = app.test_client()
    r = c.post("/describe", data="not-json", content_type="application/json")
    assert r.status_code == 400


@patch.object(GroqClient, "complete", return_value="ok summary")
def test_describe_success(_mock):
    app = create_app()
    c = app.test_client()
    r = c.post("/describe", json={"text": "audit scope"})
    assert r.status_code == 200
    assert r.get_json()["summary"] == "ok summary"


@patch.object(GroqClient, "complete", return_value="rec")
def test_recommend_route(_mock):
    app = create_app()
    c = app.test_client()
    r = c.post("/recommend", json={"text": "item"})
    assert r.status_code == 200
    assert r.get_json()["recommendations"] == "rec"


@patch.object(GroqClient, "complete", return_value="rep")
def test_report_route(_mock):
    app = create_app()
    c = app.test_client()
    r = c.post("/generate-report", json={"text": "item"})
    assert r.status_code == 200
    assert r.get_json()["report"] == "rep"
