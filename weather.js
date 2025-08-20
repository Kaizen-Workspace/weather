import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

const wcMap = {
  0:"Cielo despejado",1:"Principalmente despejado",2:"Parcialmente nublado",3:"Cubierto",
  45:"Niebla",48:"Niebla con escarcha",51:"Llovizna ligera",53:"Llovizna moderada",
  55:"Llovizna intensa",61:"Lluvia ligera",63:"Lluvia moderada",65:"Lluvia intensa",
  80:"Chubascos ligeros",81:"Chubascos moderados",82:"Chubascos violentos",
  95:"Tormenta",96:"Tormenta con granizo leve",99:"Tormenta con granizo intenso"
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
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&windspeed_unit=kmh&timezone=America/Costa_Rica`;
  const r = await fetch(url);
  if (!r.ok) return { temp:null, wind:null, desc:null };
  const d = await r.json();
  const c = d.current_weather;
  if (!c) return { temp:null, wind:null, desc:null };
  return { temp:c.temperature, wind:c.windspeed, desc:wcMap[c.weathercode] ?? null };
}

app.get("/api/provincias", async (_req, res) => {
  try {
    const lineas = await Promise.all(
      provinciasCR.map(async p => {
        const c = await obtenerClima(p.lat, p.lon);
        return `${p.nombre}: ${c.temp ?? "—"} °C, ${c.wind ?? "—"} km/h, ${c.desc ?? "—"}`;
      })
    );
    res.json({ desc: lineas.join("\n") });
  } catch {
    const lineas = provinciasCR.map(p => `${p.nombre}: — °C, — km/h, —`).join("\n");
    res.json({ desc: lineas });
  }
});

app.listen(PORT);
console.log(`Servidor corriendo en http://localhost:${PORT}`);