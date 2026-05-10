# Especificación API Go - Rotación + Factorización QR

**Servicio**: go-api  
**Framework**: Fiber v3  
**Puerto**: 3001  
**Lenguaje**: Go 1.23+

---

## Diagrama de Flujo

```mermaid
graph TD
    A["POST /api/v1/qr-factorization"] --> B{JWT Válido?}
    B -->|No| C["401 Unauthorized"]
    B -->|Sí| D{Validar body}
    D -->|Matrix inválida| E["400 Bad Request"]
    D -->|Rotation inválido| E
    D -->|Válido| F["Rotar matriz<br/>(rotation_service)"]
    F --> G["Factorizar QR<br/>(gonum/mat Householder)"]
    G --> H{¿QR exitosa?}
    H -->|No (singular)| I["422 Unprocessable"]
    H -->|Sí| J["Enviar Q, R, rotated<br/>a Node API (resty)"]
    J --> K{¿Node API responde?}
    K -->|No (timeout)| L["200 OK sin stats<br/>(graceful degradation)"]
    K -->|Sí| M["200 OK con Q, R, rotated, stats"]
```

---

## 1. Tabla de Dependencias

| Librería | Versión | ¿Por qué se agrega? | Alternativas Consideradas |
|----------|---------|---------------------|---------------------------|
| `github.com/gofiber/fiber/v3` | v3 | Framework HTTP ultra-rápido. Última versión con mejoras de rendimiento. Router optimizado, middlewares integrados, manejo de errores. | Gin (popular pero más lento), Echo (similar, menos middlewares) |
| `gonum.org/v1/gonum` | v0.17.0 | Librería científica para Go. Factorización QR nativa (`mat.QR`) con método Householder. Multiplicación de matrices (`mat.Mul`), normas vectoriales, operaciones optimizadas con BLAS/LAPACK. Sin gonum, la QR y rotaciones serían manuales y más lentas. | Implementación manual (más lento y propenso a errores), `peterGo/matrix` (menos mantenido) |
| `github.com/golang-jwt/jwt/v5` | v5.2.0 | Estándar de facto para JWT en Go. Firma y validación de tokens. Soporte HS256, RS256. | `lestrrat-go/jwx` (más pesado) |
| `github.com/joho/godotenv` | v1.5.1 | Cargar variables de entorno desde `.env`. | `spf13/viper` (overkill), `caarlos0/env` (necesita structs) |
| `github.com/go-resty/resty/v2` | v2.16.0 | Cliente HTTP moderno. Sintaxis fluida, retries automáticos, timeouts configurables. Mejor que `net/http` para servicios REST. | `net/http` nativo (más verboso, sin retries) |
| `github.com/swaggo/swag` | v1.16+ | CLI para generar documentación OpenAPI desde anotaciones en comentarios Go. `swag init` genera `docs/` con swagger.json y swagger.yaml. | `go-swagger/go-swagger` (más complejo) |
| `github.com/gofiber/swagger` | v1.1+ | Middleware Fiber para servir Swagger UI. Monta la interfaz en `/swagger/*` usando los docs generados por swaggo. | `arsmn/fiber-swagger` (deprecated, v2 no soporta Fiber v3) |

### Dependencias Indirectas (gonum)

| Librería | Propósito |
|----------|-----------|
| `gonum.org/v1/gonum/mat` | Operaciones con matrices densas |
| `gonum.org/v1/gonum/blas` | BLAS (Basic Linear Algebra Subprograms) |
| `gonum.org/v1/gonum/lapack` | LAPACK (Linear Algebra Package) |
| `gonum.org/v1/gonum/floats` | Operaciones con slices de float64 |

---

## 2. Estructura de Carpetas

```
apps/go-api/
│
├── cmd/
│   └── api/
│       └── main.go              # Punto de entrada de la aplicación
│
├── internal/
│   ├── config/
│   │   └── config.go            # Configuración y variables de entorno
│   │
│   ├── handlers/
│   │   ├── auth_handler.go      # Login y generación de JWT
│   │   ├── qr_handler.go        # Factorización QR + Rotación
│   │   └── health_handler.go    # Health check
│   │
│   ├── middleware/
│   │   ├── jwt_middleware.go    # Validación de JWT
│   │   ├── error_handler.go     # Manejo global de errores
│   │   └── logging_middleware.go # Logging de requests
│   │
│   ├── models/
│   │   ├── matrix.go            # Modelos de matriz y request/response
│   │   └── auth.go              # Modelos de autenticación
│   │
│   └── services/
│       ├── qr_service.go        # Orquestación: rotación + QR + Node
│       ├── rotation_service.go  # Lógica de rotación
│       └── node_client.go       # Cliente HTTP (resty) para Node API
│
├── pkg/
│   └── matrix/
│       ├── matrix.go            # Operaciones con gonum/mat (QR, rotación)
│       └── matrix_test.go       # Tests unitarios
│
├── tests/
│   ├── handlers_test.go         # Tests de handlers
│   └── middleware_test.go       # Tests de middleware
│
├── go.mod
├── go.sum
├── .env.example
├── Dockerfile
└── .dockerignore
```

---

## 3. Uso de gonum para Cálculos Matemáticos

### Por qué gonum

gonum v0.17.0 ofrece operaciones matriciales optimizadas que aceleran significativamente:

1. **Factorización QR**: `mat.QR` usa el método Householder, más rápido y estable que Gram-Schmidt
2. **Multiplicación de matrices**: `mat.Mul` optimizado con BLAS
3. **Normas vectoriales**: `mat.Norm` para cálculos de ortogonalidad
4. **Rotaciones**: Usando `mat.Dense` para manipulación eficiente de matrices

### Ejemplo de Factorización QR con gonum

```go
import "gonum.org/v1/gonum/mat"

func FactorizeQR(data [][]float64) (Q, R [][]float64, err error) {
    rows := len(data)
    cols := len(data[0])
    
    // Crear matriz gonum desde slice 2D
    flatData := flatten(data)
    A := mat.NewDense(rows, cols, flatData)
    
    // Factorización QR con Householder
    var qr mat.QR
    qr.Factorize(A)
    
    // Extraer Q
    q := mat.NewDense(rows, cols, nil)
    qr.QTo(q)
    
    // Extraer R
    r := mat.NewDense(cols, cols, nil)
    qr.RTo(r)
    
    // Convertir a [][]float64
    return denseToSlice(q), denseToSlice(r), nil
}
```

### Multiplicación de Matrices con gonum

```go
// Verificar A = Q * R
func VerifyDecomposition(A, Q, R *mat.Dense) bool {
    product := mat.NewDense(rows, cols, nil)
    product.Mul(Q, R)
    
    // Comparar con tolerancia
    return mat.EqualApprox(A, product, 1e-10)
}
```

### Ventajas de gonum vs Implementación Manual

| Aspecto | Manual (Gram-Schmidt) | gonum (Householder) |
|---------|----------------------|---------------------|
| Velocidad | Lenta (O(mn²) en Go) | Rápida (BLAS optimizado) |
| Precisión | Puede perder ortogonalidad | Alta estabilidad |
| Mantenibilidad | Código propenso a bugs | API probada y estable |
| Features | Solo QR básico | QR, LU, Cholesky, SVD, Eigen |

---

## 4. Endpoints

### Resumen

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/health` | Health check | No |
| POST | `/api/v1/auth/login` | Login, retorna JWT | No |
| POST | `/api/v1/qr-factorization` | Rotar matrix + QR + stats | Sí (JWT) |

---

### 4.1 POST `/api/v1/auth/login`

**Request**:
```json
{
  "username": "admin",
  "password": "secret"
}
```

**Response 200**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "type": "Bearer",
  "expiresIn": 3600
}
```

---

### 4.2 POST `/api/v1/qr-factorization`

**Request**:
```json
{
  "matrix": [[1, 2], [3, 4], [5, 6]],
  "rotation": "clockwise_90"
}
```

**Response 200**:
```json
{
  "original": [[1, 2], [3, 4], [5, 6]],
  "rotated": [[5, 3, 1], [6, 4, 2]],
  "rotation": "clockwise_90",
  "Q": [[0.1690, 0.8971], [0.5071, 0.2760], [0.8452, -0.3451]],
  "R": [[5.9161, 7.4374], [0.0000, 0.8281]],
  "stats": { "max": 7.44, "min": -0.35, "average": 2.09, "sum": 25.07, "diagonalMatrices": { "count": 0 } }
}
```

---

## 5. Validaciones y Errores

### Errores de Validación (400)

| Código | Mensaje | Condición |
|--------|---------|-----------|
| `VALIDATION_ERROR` | "Matrix is required" | Campo `matrix` ausente |
| `VALIDATION_ERROR` | "Matrix must be a non-empty array" | Matriz vacía `[]` |
| `VALIDATION_ERROR` | "Matrix must be a 2D array" | Matriz no es array de arrays |
| `VALIDATION_ERROR` | "Row X is empty" | Fila sin elementos |
| `VALIDATION_ERROR` | "Row X has Y elements, expected Z" | Filas inconsistentes |
| `VALIDATION_ERROR` | "Matrix must contain only numbers" | Elemento no numérico |
| `VALIDATION_ERROR` | "Matrix cannot contain null values" | Elemento null |
| `VALIDATION_ERROR` | "Rotation is required" | Campo `rotation` ausente |
| `VALIDATION_ERROR` | "Invalid rotation: '{value}'. Allowed: none, clockwise_90, clockwise_180, clockwise_270, transpose, horizontal_flip, vertical_flip" | Rotación inválida |
| `VALIDATION_ERROR` | "Matrix must have rows >= columns for QR" | m < n |

### Errores de Autenticación (401)

| Código | Mensaje |
|--------|---------|
| `AUTH_MISSING_TOKEN` | "Authorization header is required" |
| `AUTH_INVALID_FORMAT` | "Authorization header must be 'Bearer <token>'" |
| `AUTH_INVALID_TOKEN` | "Invalid or expired token" |
| `AUTH_INVALID_SIGNATURE` | "Invalid token signature" |

### Errores del Servidor (500)

| Código | Mensaje |
|--------|---------|
| `INTERNAL_ERROR` | "Internal server error" |
| `QR_FACTORIZATION_ERROR` | "QR factorization failed" |
| `ROTATION_ERROR` | "Rotation calculation failed" |

---

## 6. Servicios

### 6.1 QRService

```go
type QRService struct {
    nodeClient *NodeClient
}

// ProcessMatrix: rota, factoriza QR con gonum, envía stats
func (s *QRService) ProcessMatrix(matrix [][]float64, rotation string) (*FactorizationResponse, error)
```

### 6.2 RotationService

```go
type RotationService struct{}

func (s *RotationService) Rotate(matrix [][]float64, rotationType string) ([][]float64, error)
func (s *RotationService) RotateClockwise90(matrix [][]float64) [][]float64
func (s *RotationService) RotateClockwise180(matrix [][]float64) [][]float64
func (s *RotationService) RotateClockwise270(matrix [][]float64) [][]float64
func (s *RotationService) Transpose(matrix [][]float64) [][]float64
func (s *RotationService) HorizontalFlip(matrix [][]float64) [][]float64
func (s *RotationService) VerticalFlip(matrix [][]float64) [][]float64
```

### 6.3 NodeClient (con resty)

```go
type NodeClient struct {
    client   *resty.Client
    jwtToken string
}

func NewNodeClient(baseURL, jwtToken string) *NodeClient {
    client := resty.New().
        SetBaseURL(baseURL).
        SetTimeout(10 * time.Second).
        SetRetryCount(2).
        SetRetryWaitTime(1 * time.Second).
        AddRetryCondition(func(r *resty.Response, err error) bool {
            return err != nil || r.StatusCode() >= 500
        })
    return &NodeClient{client: client, jwtToken: jwtToken}
}
```

---
## 7. Documentación Swagger (swaggo + fiber-swagger)

### Instalación

```bash
# Instalar CLI de swaggo
go install github.com/swaggo/swag/cmd/swag@latest

# Agregar dependencias al go.mod
go get github.com/swaggo/swag
go get github.com/gofiber/swagger
```

### Anotaciones en main.go

```go
package main

// @title           Coding Challenge API (Go)
// @version         1.0
// @description     API para rotación de matrices y factorización QR
// @contact.name    División TI - Interseguro
// @contact.email   ti@interseguro.pe
// @license.name    MIT
// @host            localhost:3001
// @BasePath        /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization

func main() {
    app := fiber.New()
    
    // Swagger UI en /swagger/*
    app.Get("/swagger/*", swagger.HandlerDefault)
    
    app.Listen(":3001")
}
```

### Anotaciones en Handler

```go
// @Summary      Factorización QR con rotación
// @Description  Recibe una matriz rectangular y tipo de rotación, rota la matriz, realiza factorización QR y retorna Q, R, matriz rotada y estadísticas
// @Tags         QR
// @Accept       json
// @Produce      json
// @Param        body body MatrixRequest true "Matriz y rotación"
// @Success      200  {object} FactorizationResponse
// @Failure      400  {object} ErrorResponse "Error de validación"
// @Failure      401  {object} ErrorResponse "No autorizado"
// @Failure      422  {object} ErrorResponse "Matriz singular"
// @Failure      500  {object} ErrorResponse "Error interno"
// @Security     BearerAuth
// @Router       /api/v1/qr-factorization [post]
func handleQRFactorization(c *fiber.Ctx) error {
    // ...
}

// @Summary      Login de usuario
// @Description  Autentica usuario y retorna JWT
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        body body AuthRequest true "Credenciales"
// @Success      200  {object} AuthResponse
// @Failure      400  {object} ErrorResponse
// @Failure      401  {object} ErrorResponse
// @Router       /api/v1/auth/login [post]
func handleLogin(c *fiber.Ctx) error {
    // ...
}
```

### Generación de Documentación

```bash
# Desde apps/go-api/
swag init -g cmd/api/main.go -o docs/swagger

# Se genera:
# docs/swagger/
# ├── docs.go         # Código Go exportado
# ├── swagger.json    # OpenAPI 2.0 spec
# └── swagger.yaml    # YAML alternativo
```

### Estructura Resultante

```
apps/go-api/
├── cmd/api/main.go      # Anotaciones @title, @version, etc
├── docs/
│   └── swagger/          # Generado por swag init
│       ├── docs.go
│       ├── swagger.json
│       └── swagger.yaml
└── internal/handlers/    # Anotaciones @Summary en cada handler
```

### Acceso

| URL | Descripción |
|-----|-------------|
| `http://localhost:3001/swagger/index.html` | Swagger UI interactivo |
| `http://localhost:3001/swagger/doc.json` | OpenAPI JSON spec |

### Comando de Regeneración

```bash
# Re-generar cada vez que se modifican anotaciones
swag init -g cmd/api/main.go -o docs/swagger
```

### Notas

- Las anotaciones se escriben en comentarios `// @tag` antes de la función
- `swag init` escanea todo el proyecto en busca de anotaciones
- El middleware `swagger.HandlerDefault` sirve la UI desde la carpeta generada
- La ruta `/swagger/*` no requiere autenticación JWT
- Las anotaciones de modelos (`@Success 200 {object} FactorizationResponse`) requieren que el struct esté en un paquete accesible

---

## 8. Tests

| Tipo | Archivo | Framework |
|------|---------|-----------|
| Unitarios Matrix | `pkg/matrix/matrix_test.go` | go test |
| Unitarios Handlers | `tests/handlers_test.go` | go test + httptest |
| Unitarios Middleware | `tests/middleware_test.go` | go test |

### Comandos

```bash
go test ./... -v          # Todos los tests
go test ./... -cover      # Con cobertura
go test ./pkg/matrix -v   # Solo matrix
go test ./pkg/matrix -bench=.  # Benchmarks
```

---

## 9. Variables de Entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT` | `3001` | Puerto HTTP |
| `NODE_API_URL` | `http://node-api:3002` | URL Node API |
| `JWT_SECRET` | `default-secret` | Secret JWT |
| `JWT_EXPIRATION` | `3600` | Expiración token (seg) |
| `AUTH_USERNAME` | `admin` | Usuario login |
| `AUTH_PASSWORD` | `secret` | Contraseña login |

---

**Documento versión**: 3.0  
**Última actualización**: Junio 2024
