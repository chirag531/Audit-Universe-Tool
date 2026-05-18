from flask import Blueprint, jsonify, request
from middleware.sanitizer import sanitize_text


def create_report_bp(client, limiter, rate):
    bp = Blueprint("report", __name__)

    @bp.post("/generate-report")
    @limiter.limit(rate)
    def report_route():
        text = sanitize_text((request.get_json(silent=True) or {}).get("text", ""))
        return jsonify({"report": client.complete("report", text)})

    return bp
