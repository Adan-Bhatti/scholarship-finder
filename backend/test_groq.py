import httpx

API_KEY = "YOUR_GROQ_API_KEY"
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
    print("Response JSON:")
    print(response.json())
except Exception as e:
    print("Error:", str(e))
