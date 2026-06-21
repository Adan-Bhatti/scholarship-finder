"""
Quick test script to verify the Groq API key works.
Run from the scholarship finder root:
  $env:PYTHONPATH="c:\\Users\\lenovo\\OneDrive\\Desktop\\scholarship finder"
  & "backend\\venv\\Scripts\\python.exe" "backend\\test_groq.py"
"""
import os
import sys
import httpx
from pathlib import Path

# Load .env manually so we don't depend on pydantic_settings path resolution
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    for line in env_path.read_text(encoding="ascii", errors="ignore").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, _, v = line.partition("=")
            os.environ.setdefault(k.strip(), v.strip())

API_KEY = os.environ.get("GROQ_API_KEY", "")
if not API_KEY:
    print("ERROR: GROQ_API_KEY is not set in backend/.env")
    sys.exit(1)

url = "https://api.groq.com/openai/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}
payload = {
    "model": "llama-3.1-8b-instant",
    "messages": [
        {"role": "system", "content": "You are a helpful API that returns strictly formatted JSON."},
        {"role": "user", "content": "Return a JSON object with a single key 'status' and value 'success'."}
    ],
    "response_format": {"type": "json_object"},
    "temperature": 0.2
}

try:
    response = httpx.post(url, json=payload, headers=headers, timeout=10.0)
    print("Status Code:", response.status_code)
    if response.status_code == 200:
        content = response.json()["choices"][0]["message"]["content"]
        print("✅ Groq API is working! Response:", content)
    elif response.status_code == 401:
        print("❌ Invalid API key. Please generate a new one at https://console.groq.com/keys")
    else:
        print("Response JSON:", response.json())
except Exception as e:
    print("Error:", str(e))
