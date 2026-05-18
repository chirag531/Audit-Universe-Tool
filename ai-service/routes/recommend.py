from flask import Blueprint, jsonify, request
from middleware.sanitizer import sanitize_text


def create_recommend_bp(client, limiter, rate):
    bp = Blueprint("recommend", __name__)

    @bp.post("/recommend")
    @limiter.limit(rate)
    def recommend_route():
        text = sanitize_text((request.get_json(silent=True) or {}).get("text", ""))
        return jsonify({"recommendations": client.complete("recommend", text)})

    return bp
