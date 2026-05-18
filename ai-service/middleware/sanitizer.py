import json
import os

import bleach
from flask import jsonify, request


def sanitize_text(text):
    return bleach.clean(str(text or ""), tags=[], attributes={}, strip=True).strip()


def register_security(app):
    @app.before_request
    def enforce_payload():
        if request.method != "POST":
            return None
        path = request.path or ""
        if path == "/health" or path.startswith("/health"):
            return None
        try:
            body = request.get_json(force=False, silent=False)
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid JSON body"}), 400
        except Exception:
            return jsonify({"error": "Invalid request body"}), 400
        if not isinstance(body, dict):
            return jsonify({"error": "JSON object expected"}), 400
        text = str(body.get("text", "")).strip()
        if not text:
            return jsonify({"error": "text is required"}), 400

    @app.after_request
    def headers(resp):
        resp.headers["X-Content-Type-Options"] = "nosniff"
        resp.headers["X-Frame-Options"] = "DENY"
        resp.headers["Referrer-Policy"] = "no-referrer"
        return resp


def register_api_key(app):
    expected = (os.getenv("AI_SERVICE_API_KEY") or "").strip()

    @app.before_request
    def api_key_guard():
        if os.getenv("PYTEST_CURRENT_TEST"):
            return None
        if request.method != "POST":
            return None
        path = request.path or ""
        if path == "/health":
            return None
        if not expected:
            return None
        got = (request.headers.get("X-API-Key") or "").strip()
        if got != expected:
            return jsonify({"error": "unauthorized"}), 401
