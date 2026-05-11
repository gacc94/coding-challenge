# Deploy Render — Go API (Web Service)

**Tipo**: Web Service  
**Plan**: Free ($0/mes)  
**URL**: `https://go-api-xxxx.onrender.com`  
**Dockerfile**: `apps/go-api/Dockerfile`  
**Puerto**: 3001  

---

## 1. Configuracion en Render

```
Render Dashboard → New + → Web Service
```

| Campo | Valor | ⚠️ Detalle critico |
|---|---|---|
| **Name** | `go-api` | Identificador unico |
| **Language** | `Docker` | |
| **Branch** | `main` | |
| **Region** | `Oregon (US West)` | Misma region que `node-api` |
| **Root Directory** | `apps/go-api` | Render hace `cd` a esta carpeta antes del build |
| **Dockerfile Path** | `Dockerfile` | ⚠️ **Relativo a Root Directory**. Si Root es `apps/go-api`, esto es solo `Dockerfile` (NO `apps/go-api/Dockerfile`) |
| **Docker Build Context** | `apps/go-api` | ⚠️ **Ruta absoluta desde raiz del repo**. Debe ser la misma que Root Directory |
| **Instance Type** | `Free` ($0/mes) | |
| **Health Check Path** | `/health` | |
| **Pre-Deploy Command** | _(dejar vacio)_ | |
| **Auto-Deploy** | `On Commit` | |
| **Included Paths** | `apps/go-api/**` | Solo redeploya si cambia esta carpeta |

---

## 2. Environment Variables

| Key | Value |
|---|---|
| `PORT` | `3001` |
| `JWT_SECRET` | `super-secret-prod-2024` |
| `AUTH_USERNAME` | `admin` |
| `AUTH_PASSWORD` | `secret` |
| `NODE_API_URL` | `https://node-api-xxxx.onrender.com` |

> **Critico**: `NODE_API_URL` debe ser la URL real del Node API en Render. Ejemplo: `https://node-api-jqy3.onrender.com`. No uses `localhost` ni `http://node-api:3002`.

---

## 3. Verificacion Post-Deploy

```bash
# 1. Health check
curl https://go-api-xxxx.onrender.com/health
# → {"status":"ok","service":"go-api"}

# 2. Swagger UI
open https://go-api-xxxx.onrender.com/swagger

# 3. Login
TOKEN=$(curl -s -X POST https://go-api-xxxx.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"secret"}' | jq -r '.token')

# 4. QR Factorization (Go API → Node API → Go API)
curl -s -X POST https://go-api-xxxx.onrender.com/api/v1/qr-factorization \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"matrix":[[1,2,3],[4,5,8],[7,8,9]],"rotation":"clockwise_90"}' | jq

# 5. Verificar stats NO es null
# Si stats es null → revisar NODE_API_URL
# Si stats tiene datos → flujo completo funciona ✅
```

---

## 4. Troubleshooting

| Error | Causa | Solucion |
|---|---|---|
| `invalid local: resolve` al buildear | Dockerfile Path mal configurado | Debe ser `Dockerfile` (relativo a Root Directory), NO `apps/go-api/Dockerfile` |
| `no such file or directory` | Docker Build Context incorrecto | Debe ser `apps/go-api` (ruta desde raiz del repo) |
| `go.mod requires go >= 1.25.0` | Imagen base muy vieja | El Dockerfile usa `golang:1.25-alpine`. No cambiar. |
| `go mod download` falla | `go.sum` no commiteado | Verificar que `apps/go-api/go.sum` existe en el repo |
| `stats: null` en respuesta | Node API no responde | Verificar `NODE_API_URL` es la URL real de Node API en Render |
| `stats: null` con URL correcta | Node API en cold start | Esperar ~30s y reintentar |
| Swagger no carga CSS/JS | CDN bloqueado | Swagger carga desde `cdn.jsdelivr.net`. Verificar conectividad. |
