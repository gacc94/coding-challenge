# Coding Challenge - Interseguro

## Descripcion

Solucion tecnica del coding challenge de la Division TI de Interseguro. Implementa un sistema distribuido con dos APIs RESTful y un frontend Angular para realizar rotacion de matrices, factorizacion QR y calculo de estadisticas.

### Arquitectura

```
Cliente (Postman / Angular 21)
    |
    | POST /api/v1/qr-factorization { matrix, rotation }
    v
Go API (Fiber v3, puerto 3001)
    |
    | 1. Validar JWT
    | 2. Rotar matriz (clockwise_90, 180, 270, transpose, flips)
    | 3. Factorizar QR (Gram-Schmidt Modificado)
    |
    | POST /api/v1/stats { matrices: [Q, R, rotated] }
    v
Node.js API (Express 5, puerto 3002)
    |
    | 1. Validar JWT
    | 2. Calcular estadisticas (max, min, average, sum)
    | 3. Verificar matrices diagonales
    |
    | { max, min, average, sum, diagonalMatrices }
    v
Go API ---> Cliente { original, rotated, Q, R, stats }
```

## Stack Tecnologico

| Componente | Tecnologia |
|---|---|
| Go API | Go 1.23, Fiber v3, gonum/mat, golang-jwt/v5, resty/v2 |
| Node API | Node.js 20, Express 5.2.1, TypeScript 6.0.3, Zod 4.4.3 |
| Frontend | Angular 21, Material, CDK, SCSS, Signals |
| Testing | Go testing, Vitest 4.1.5 |
| CI/CD | GitHub Actions |
| Containers | Docker, Docker Compose |

## Inicio Rapido

### Prerequisitos

- Go 1.23+
- Node.js 20+
- Docker & Docker Compose
- Bun (opcional, para Node API)

### 1. Docker Compose (recomendado)

```bash
# Construir y levantar todos los servicios
make up

# Ver logs
make logs

# Detener servicios
make down
```

### 2. Desarrollo Local

```bash
# Terminal 1: Go API
cd apps/go-api
JWT_SECRET=supersecret123 go run ./cmd/api

# Terminal 2: Node API
cd apps/node-api
npm ci
npm run dev

# Terminal 3: Tests
make test-all
```

## Endpoints

### Go API (puerto 3001)

| Metodo | Ruta | Descripcion | Auth |
|---|---|---|---|
| GET | `/health` | Health check | No |
| GET | `/swagger/index.html` | Swagger UI | No |
| GET | `/swagger/doc.json` | OpenAPI JSON | No |
| POST | `/api/v1/auth/login` | Login, obtiene JWT | No |
| POST | `/api/v1/qr-factorization` | Rotacion + QR + Stats | Si |

### Node API (puerto 3002)

| Metodo | Ruta | Descripcion | Auth |
|---|---|---|---|
| GET | `/health` | Health check | No |
| GET | `/api-docs` | Swagger UI | No |
| GET | `/api-docs.json` | OpenAPI JSON | No |
| POST | `/api/v1/auth/login` | Login, obtiene JWT | No |
| POST | `/api/v1/stats` | Estadisticas de matrices | Si |

## Testing

```bash
# Todos los tests
make test-all

# Solo Go
make test-go

# Solo Node (con coverage)
make test-node-coverage

# Node en modo watch
cd apps/node-api && npm run test:watch
```

## Variables de Entorno

Copiar `.env.example` a `.env` en cada app:

| Variable | Default | Descripcion |
|---|---|---|
| `PORT` | 3001/3002 | Puerto HTTP |
| `JWT_SECRET` | `supersecret123` | Secret para JWT |
| `JWT_EXPIRATION` | `3600` | Expiración en segundos |
| `AUTH_USERNAME` | `admin` | Usuario para login |
| `AUTH_PASSWORD` | `secret` | Password para login |
| `NODE_API_URL` | `http://localhost:3002` | URL de Node API (Go API) |

## Estructura del Monorepo

```
coding-challenge/
  apps/
    go-api/         # Go API (Fiber v3, QR, rotacion)
    node-api/       # Node API (Express 5, stats, Zod)
    frontend/       # Angular 21 (futuro)
  docs/
    architecture.md
    CODING_CONVENTIONS.md
    specs/          # Especificaciones detalladas
  docker-compose.yml
  Makefile
  .github/workflows/ci.yml
```

## Comandos Makefile

```bash
make help          # Lista todos los comandos
make up            # Iniciar todo con Docker
make down          # Detener todo
make test-all      # Tests Go + Node
make logs          # Ver logs de todos
make clean         # Limpiar builds y containers
```
