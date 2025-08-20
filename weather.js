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
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&windspeed_unit=kmh&timezone=America/Costa_Rica`;
  const res = await fetch(url);
  if (!res.ok) return { temp: null, wind: null, desc: null };
  const d = await res.json();
  const c = d.current;
  if (!c) return { temp: null, wind: null, desc: null };
  return {
    temp: c.temperature_2m ?? null,
    wind: c.wind_speed_10m ?? null,
    desc: wcMap[c.weather_code] ?? null
  };
}

app.get("/api/provincias", async (_req, res) => {
  const lista = await Promise.all(
    provinciasCR.map(async p => {
      try {
        const c = await obtenerClima(p.lat, p.lon);
        return { provincia: p.nombre, temp: c.temp, wind: c.wind, desc: c.desc };
      } catch {
        return { provincia: p.nombre, temp: null, wind: null, desc: null };
      }
    })
  );
  res.json(lista);
});

app.listen(PORT);
console.log(`Servidor corriendo en http://localhost:${PORT}/api/provincias`);