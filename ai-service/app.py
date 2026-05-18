import os

from flask import Flask
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from middleware.sanitizer import register_api_key, register_security
from routes.describe import create_describe_bp
from routes.health import health_bp
from routes.recommend import create_recommend_bp
from routes.report import create_report_bp
from services.groq_client import GroqClient


def create_app():
    app = Flask(__name__)
    rate = os.getenv("AI_SERVICE_RATE_LIMIT_PER_MIN", "30") + " per minute"
    limiter = Limiter(get_remote_address, app=app, default_limits=[rate])
    register_security(app)
    register_api_key(app)
    client = GroqClient()
    app.register_blueprint(create_describe_bp(client, limiter, rate))
    app.register_blueprint(create_recommend_bp(client, limiter, rate))
    app.register_blueprint(create_report_bp(client, limiter, rate))
    app.register_blueprint(health_bp)
    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
