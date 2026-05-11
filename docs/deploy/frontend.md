# Deploy Netlify — Frontend Angular 21 (Static Site)

**Tipo**: Static Site  
**Plan**: Free ($0/mes — ilimitado, sin tarjeta)  
**URL**: `https://coding-challenge-gacc.netlify.app`  
**Framework**: Angular 21.2  
**Build Output**: `dist/frontend/browser`  

---

## 1. Archivos del Proyecto

### `netlify.toml` (raiz del repo)

```toml
[build]
  base = "apps/frontend"
  command = "npm ci && npm run build"
  publish = "dist/frontend/browser"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Este archivo **debe estar en la raiz del repositorio**, no dentro de `apps/frontend/`. Netlify lo lee desde ahi.

### `environment.production.ts`

```typescript
// apps/frontend/src/environments/environment.production.ts
export const environment = {
  production: true,
  apiGoUrl: 'https://go-api-xxxx.onrender.com',  // ← actualizar con URL real
};
```

---

## 2. Formulario en Netlify

```
netlify.com → Sites → Import from Git → seleccionar repo
```

| Campo | Valor |
|---|---|
| **Branch to deploy** | `main` |
| **Base directory** | `apps/frontend` |
| **Build command** | `npm ci && npm run build` |
| **Publish directory** | `dist/frontend/browser` |
| **Functions directory** | _(dejar vacio)_ |

> Si ya configuraste `netlify.toml` en la raiz, Netlify lee los valores desde ahi. Solo necesitas conectar el repo. Las redirects SPA (`/* → /index.html`) tambien las toma del toml.

---

## 3. Deploy

Cada push a `main` dispara el deploy automatico. Duracion: ~2 minutos.

```
git add -A
git commit -m "deploy: frontend to Netlify"
git push origin main
```

---

## 4. Verificacion

```bash
# Pagina principal
open https://coding-challenge-gacc.netlify.app

# SPA routing (no debe dar 404)
open https://coding-challenge-gacc.netlify.app/login
open https://coding-challenge-gacc.netlify.app/overview
open https://coding-challenge-gacc.netlify.app/input
open https://coding-challenge-gacc.netlify.app/results
```

---

## 5. Troubleshooting

| Error | Causa | Solucion |
|---|---|---|
| 404 al recargar `/dashboard` | `netlify.toml` no encontrado | Esta en la **raiz** del repo, no en `apps/frontend/` |
| 404 al recargar (con toml en raiz) | Build settings sobrescriben el toml | En Netlify UI, dejar **Build command** y **Publish directory** igual que en el toml |
| `Invalid credentials` al hacer login | `apiGoUrl` apunta a `localhost:3001` | Actualizar `environment.production.ts` con la URL real de Go API en Render |
| Pantalla en blanco | Error en el bundle JS | Netlify deploy log → buscar errores de build |
| `CORS error` | Go API no permite el origen | La Go API con Fiber v3 acepta CORS por defecto. Verificar que la URL en `apiGoUrl` es correcta. |
| `ERR_CONNECTION_REFUSED` | Go API no desplegada o caida | Verificar que Go API esta "Live" en Render |

---

## 6. Actualizar URL de Go API

Cuando la Go API este desplegada en Render:

```typescript
// apps/frontend/src/environments/environment.production.ts
export const environment = {
  production: true,
  apiGoUrl: 'https://go-api-xxxx.onrender.com',  // ← URL real
};
```

Commit + push. Netlify redeploya. El frontend ahora apunta a la API real.

---

**URL**: [https://coding-challenge-gacc.netlify.app](https://coding-challenge-gacc.netlify.app)  
**Plataforma**: Netlify (Free)  
**SPA Routing**: ✅ via `netlify.toml`
