# Deploy Render — Node API (Web Service)

**Tipo**: Web Service  
**Plan**: Free ($0/mes)  
**URL**: `https://node-api-xxxx.onrender.com`  
**Dockerfile**: `apps/node-api/Dockerfile`  
**Puerto**: 3002  

---

## 1. Configuracion en Render

```
Render Dashboard → New + → Web Service
```

| Campo | Valor | ⚠️ Detalle critico |
|---|---|---|
| **Name** | `node-api` | Identificador unico |
| **Language** | `Docker` | |
| **Branch** | `main` | |
| **Region** | `Oregon (US West)` | Misma region que `go-api` |
| **Root Directory** | `apps/node-api` | Render hace `cd` a esta carpeta antes del build |
| **Dockerfile Path** | `Dockerfile` | ⚠️ **Relativo a Root Directory**. Si Root es `apps/node-api`, esto es solo `Dockerfile` (NO `apps/node-api/Dockerfile`) |
| **Docker Build Context** | `apps/node-api` | ⚠️ **Ruta absoluta desde raiz del repo**. Debe ser la misma que Root Directory |
| **Instance Type** | `Free` ($0/mes) | |
| **Health Check Path** | `/health` | |
| **Pre-Deploy Command** | _(dejar vacio)_ | |
| **Auto-Deploy** | `On Commit` | |
| **Included Paths** | `apps/node-api/**` | Solo redeploya si cambia esta carpeta |

---

## 2. Environment Variables

| Key | Value |
|---|---|
| `PORT` | `3002` |
| `JWT_SECRET` | `super-secret-prod-2024` |
| `AUTH_USERNAME` | `admin` |
| `AUTH_PASSWORD` | `secret` |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `*` |

---

## 3. Verificacion Post-Deploy

```bash
# Health check
curl https://node-api-xxxx.onrender.com/health
# → {"status":"ok","service":"node-api","environment":"production"}

# Login
curl -X POST https://node-api-xxxx.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"secret"}'
# → {"token":"eyJ...","type":"Bearer","expiresIn":3600}

# Stats (requiere JWT)
TOKEN="eyJ..."
curl -X POST https://node-api-xxxx.onrender.com/api/v1/stats \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"matrices":[[[1,2],[3,4]],[[5,6],[7,8]]]}'
# → {"max":8,"min":1,"average":4.5,...}
```

---

## 4. Troubleshooting

| Error | Causa | Solucion |
|---|---|---|
| `invalid local: resolve` al buildear | Dockerfile Path mal configurado | Debe ser `Dockerfile` (relativo a Root Directory), NO `apps/node-api/Dockerfile` |
| `no such file or directory` | Docker Build Context incorrecto | Debe ser `apps/node-api` (ruta desde raiz del repo) |
| Build pasa pero health check falla | La app no responde en `/health` | Verificar logs en Render dashboard |
| `AUTH_INVALID_TOKEN` | JWT_SECRET diferente al Go API | Ambos deben tener el mismo `JWT_SECRET` |
| `npm install` falla | `package-lock.json` no commiteado | Verificar que existe en el repo |
| `tsc` no compila | `.dockerignore` excluye `src/` o `tsconfig.json` | El `.dockerignore` NO debe excluir `src/` ni `tsconfig.json` |
