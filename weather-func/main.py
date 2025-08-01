import os, requests

WEATHER_API_KEY = os.environ["WEATHER_API_KEY"]
BASE_URL        = "http://api.weatherapi.com/v1/current.json"

# Ejemplo de manejo CORS en main.py
def obtener_clima(request):
    # Preflight
    if request.method == 'OPTIONS':
        return ('', 204, {
            'Access-Control-Allow-Origin':  '*',
            'Access-Control-Allow-Methods': 'GET,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        })

    # Lógica normal
    location = request.args.get("location", "auto:ip")
    params   = {"key": WEATHER_API_KEY, "q": location, "aqi": "no"}
    resp     = requests.get(BASE_URL, params=params, timeout=10)

    # Responde datos + CORS
    headers = {
        'Content-Type':               'application/json',
        'Access-Control-Allow-Origin': '*',
    }
    return (resp.text, resp.status_code, headers)
