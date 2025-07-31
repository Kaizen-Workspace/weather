import os
import requests

# Aquí va el NOMBRE de la variable de entorno, no la clave literal
WEATHER_API_KEY = os.environ.get("WEATHER_API_KEY")
BASE_URL        = "http://api.weatherapi.com/v1/current.json"

def obtener_clima(request):
    # Si no recibe parámetro, usa geo-IP
    location = request.args.get("location", "auto:ip")
    params   = {
        "key": WEATHER_API_KEY,
        "q":   location,
        "aqi": "no"
    }
    resp = requests.get(BASE_URL, params=params, timeout=10)
    return (resp.text, resp.status_code, {"Content-Type": "application/json"})
