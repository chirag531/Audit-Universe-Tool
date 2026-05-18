from flask import Blueprint, jsonify, request
from middleware.sanitizer import sanitize_text


def create_describe_bp(client, limiter, rate):
    bp = Blueprint("describe", __name__)

    @bp.post("/describe")
    @limiter.limit(rate)
    def describe_route():
        text = sanitize_text((request.get_json(silent=True) or {}).get("text", ""))
        return jsonify({"summary": client.complete("describe", text)})

    return bp
