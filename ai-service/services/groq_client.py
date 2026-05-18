import hashlib
import os
from pathlib import Path

import requests
from cachetools import TTLCache
from tenacity import retry, stop_after_attempt, wait_fixed

_PROMPT_DIR = Path(__file__).resolve().parent.parent / "prompts"


def _load_prompt(name: str) -> str:
    path = _PROMPT_DIR / f"{name}.txt"
    if path.is_file():
        return path.read_text(encoding="utf-8").strip()
    return f"You are assisting with audit work. Task: {name}."


class GroqClient:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY", "")
        self.base_url = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1/chat/completions")
        self.model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
        self.cache = TTLCache(maxsize=1024, ttl=300)
        self._redis = None
        redis_url = os.getenv("REDIS_URL", "").strip()
        if redis_url:
            try:
                import redis

                self._redis = redis.Redis.from_url(redis_url, decode_responses=True)
                self._redis.ping()
            except Exception:
                self._redis = None

    def _cache_get(self, key: str):
        if self._redis:
            try:
                return self._redis.get(key)
            except Exception:
                pass
        return self.cache.get(key)

    def _cache_set(self, key: str, value: str):
        if self._redis:
            try:
                self._redis.setex(key, 300, value)
            except Exception:
                pass
        self.cache[key] = value

    @retry(stop=stop_after_attempt(3), wait=wait_fixed(1))
    def _call(self, prompt_name: str, text: str):
        prompt = _load_prompt(prompt_name)
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": f"{prompt}\n\n{text}"}],
            "temperature": 0.2,
        }
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        resp = requests.post(self.base_url, json=payload, headers=headers, timeout=15)
        resp.raise_for_status()
        body = resp.json()
        return body["choices"][0]["message"]["content"].strip()

    def complete(self, prompt_name: str, text: str):
        digest = hashlib.sha256(f"{prompt_name}:{text}".encode("utf-8")).hexdigest()
        key = f"ai:{prompt_name}:{digest}"
        hit = self._cache_get(key)
        if hit:
            return hit
        if not self.api_key:
            result = self._fallback(prompt_name, text)
            self._cache_set(key, result)
            return result
        try:
            result = self._call(prompt_name, text)
        except Exception:
            result = self._fallback(prompt_name, text)
        self._cache_set(key, result)
        return result

    def _fallback(self, prompt_name: str, text: str):
        words = (text or "").split()
        clipped = " ".join(words[:40]) + (" ..." if len(words) > 40 else "")
        return f"{_load_prompt(prompt_name)[:200]} — {clipped}".strip()
