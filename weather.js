import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

const wcMap = {
  0: "Cielo despejado", 1: "Principalmente despejado", 2: "Parcialmente nublado", 3: "Cubierto",
  45: "Niebla", 48: "Niebla con escarcha", 51: "Llovizna ligera", 53: "Llovizna moderada",
  55: "Llovizna intensa", 61: "Lluvia ligera", 63: "Lluvia moderada", 65: "Lluvia intensa",
  80: "Chubascos ligeros", 81: "Chubascos moderados", 82: "Chubascos violentos",
  95: "Tormenta", 96: "Tormenta con granizo leve", 99: "Tormenta con granizo intenso"
};

const provinciasCR = [
  { nombre:"San José", lat:9.9325, lon:-84.0789 },
  { nombre:"Alajuela", lat:10.0162, lon:-84.2116 },
  { nombre:"Cartago", lat:9.8644, lon:-83.9194 },
  { nombre:"Heredia", lat:9.9981, lon:-84.1176 },
  { nombre:"Guanacaste", lat:10.6346, lon:-85.4377 },
  { nombre:"Puntarenas", lat:9.9763, lon:-84.8384 },
  { nombre:"Limón", lat:9.9907, lon:-83.0360 }
];

async function obtenerClima(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&windspeed_unit=kmh&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.current_weather
    ? {
        temp: data.current_weather.temperature,
        wind: data.current_weather.windspeed,
        code: data.current_weather.weathercode,
        desc: wcMap[data.current_weather.weathercode] || "—"
      }
    : null;
}

// 📌 Endpoint 1: Clima de todas las provincias
app.get("/api/provincias", async (req, res) => {
  try {
    const results = [];
    for (const p of provinciasCR) {
      try {
        const clima = await obtenerClima(p.lat, p.lon);
        results.push({
          provincia: p.nombre,
          lat: p.lat,
          lon: p.lon,
          ...clima
        });
      } catch {
        results.push({ provincia: p.nombre, error: true });
      }
    }
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 📌 Endpoint 2: Clima en coordenadas específicas
app.get("/api/clima", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: "Parámetros 'lat' y 'lon' requeridos" });
  }
  try {
    const clima = await obtenerClima(parseFloat(lat), parseFloat(lon));
    if (!clima) return res.json({ error: "No hay datos" });
    res.json({
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      ...clima
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
