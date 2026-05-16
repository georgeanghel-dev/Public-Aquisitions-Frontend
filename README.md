# Achiziții Publice — Frontend Vue 3

## Instalare și rulare locală

```bash
# 1. Instalează dependențele
npm install 

# 2. Copiază .env.example în .env și setează API URL-ul
cp .env.example .env

# 3. Pornește serverul de development
npm run dev
```

Aplicația va fi disponibilă la `http://localhost:3000`

## Build pentru producție 

```bash
npm run build
```

## Structura proiectului

```
src/
├── main.js              # Punctul de intrare
├── App.vue              # Componenta rădăcină
├── api.js               # Toate apelurile API
├── router/
│   └── index.js         # Rutele aplicației
├── assets/
│   ├── global.css       # Design system global
│   └── media/           # Logo-uri, imagini
├── layouts/
│   └── MainLayout.vue   # Layout cu header + sidebar
├── views/               # Paginile aplicației
└── components/          # Componentele reutilizabile
```

## Design System

Vezi `src/assets/DESIGN-SYSTEM.md` pentru documentația completă.

## Variabile de mediu

| Variabilă | Descriere | Default |
|-----------|-----------|---------|
| `VITE_API_URL` | URL-ul backend-ului | `http://localhost:4000/` |
