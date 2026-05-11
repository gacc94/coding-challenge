# Postman Collection - Coding Challenge Interseguro

**Archivo**: `docs/postman/interseguro-challenge.postman_collection.json`  
**Prerrequisitos**: Docker Compose corriendo (`make up`)

---

## 1. Variables de Entorno (Environment)

```json
{
  "name": "Interseguro Challenge - Local",
  "values": [
    {
      "key": "go_api_url",
      "value": "http://localhost:3001",
      "enabled": true
    },
    {
      "key": "node_api_url",
      "value": "http://localhost:3002",
      "enabled": true
    },
    {
      "key": "jwt_token",
      "value": "",
      "enabled": true
    },
    {
      "key": "username",
      "value": "admin",
      "enabled": true
    },
    {
      "key": "password",
      "value": "secret",
      "enabled": true
    }
  ]
}
```

---

## 2. Estructura de la Colección

```
📂 Interseguro Coding Challenge
│
├── 📁 Health Checks
│   ├── GET Go API Health
│   └── GET Node API Health
│
├── 📁 Autenticación
│   ├── POST Login (Go API)
│   └── POST Login (Node API)
│
├── 📁 Factorización QR
│   ├── POST QR Básico (sin rotación)
│   ├── POST QR con Rotación 90°
│   ├── POST QR con Rotación 180°
│   ├── POST QR con Transposición
│   ├── POST QR con Volteo Horizontal
│   ├── POST QR con Volteo Vertical
│   └── POST QR Matriz 3x3 (identidad)
│
├── 📁 Estadísticas (Directo Node API)
│   ├── POST Stats con 2 matrices
│   ├── POST Stats con 3 matrices
│   └── POST Stats con matriz diagonal
│
├── 📁 Errores (Validaciones)
│   ├── POST Sin JWT (401)
│   ├── POST Matriz vacía (400)
│   ├── POST Rotación inválida (400)
│   ├── POST Matriz singular (422)
│   ├── POST Con strings en vez de números (400)
│   └── POST Stats sin matrices (400)
│
└── 📁 Flujo Completo
    └── 🔄 Login → QR → Stats (Flujo E2E)
```

---

## 3. Requests Detallados

### 3.1 Health Checks

#### `GET Go API Health`

```
GET {{go_api_url}}/health

Test Script:
  pm.test("Status 200", () => pm.response.to.have.status(200));
  pm.test("Service is go-api", () => {
    const json = pm.response.json();
    pm.expect(json.service).to.eql("go-api");
  });
```

#### `GET Node API Health`

```
GET {{node_api_url}}/health

Test Script:
  pm.test("Status 200", () => pm.response.to.have.status(200));
  pm.test("Service is node-api", () => {
    const json = pm.response.json();
    pm.expect(json.service).to.eql("node-api");
  });
```

---

### 3.2 Autenticación

#### `POST Login (Go API)`

```
POST {{go_api_url}}/api/v1/auth/login
Content-Type: application/json

Body:
{
  "username": "{{username}}",
  "password": "{{password}}"
}

Pre-request Script:
  // Limpiar token antes del login
  pm.environment.set("jwt_token", "");

Test Script:
  pm.test("Status 200", () => pm.response.to.have.status(200));
  
  pm.test("Token JWT generado", () => {
    const json = pm.response.json();
    pm.expect(json.token).to.be.a("string");
    pm.expect(json.type).to.eql("Bearer");
    pm.expect(json.expiresIn).to.eql(3600);
    
    // Guardar token para requests siguientes
    pm.environment.set("jwt_token", json.token);
  });
```

#### `POST Login (Node API)`

```
POST {{node_api_url}}/api/v1/auth/login
Content-Type: application/json

Body:
{
  "username": "{{username}}",
  "password": "{{password}}"
}

Test Script:
  pm.test("Status 200", () => pm.response.to.have.status(200));
  pm.test("Token JWT generado", () => {
    const json = pm.response.json();
    pm.environment.set("jwt_token", json.token);
  });
```

---

### 3.3 Factorización QR

#### `POST QR Básico (sin rotación)`

```
POST {{go_api_url}}/api/v1/qr-factorization
Content-Type: application/json
Authorization: Bearer {{jwt_token}}

Body:
{
  "matrix": [
    [1, 2],
    [3, 4],
    [5, 6]
  ],
  "rotation": "none"
}

Test Script:
  pm.test("Status 200", () => pm.response.to.have.status(200));
  
  const json = pm.response.json();
  
  pm.test("Campo original presente", () => {
    pm.expect(json.original).to.be.an("array");
  });
  
  pm.test("Campo rotated presente", () => {
    pm.expect(json.rotated).to.be.an("array");
  });
  
  pm.test("Campo Q presente y es matriz 3x2", () => {
    pm.expect(json.Q).to.be.an("array").with.lengthOf(3);
    pm.expect(json.Q[0]).to.have.lengthOf(2);
  });
  
  pm.test("Campo R presente y es matriz 2x2", () => {
    pm.expect(json.R).to.be.an("array").with.lengthOf(2);
    pm.expect(json.R[0]).to.have.lengthOf(2);
  });
  
  pm.test("Campo stats presente", () => {
    pm.expect(json.stats).to.be.an("object");
    pm.expect(json.stats.max).to.be.a("number");
    pm.expect(json.stats.min).to.be.a("number");
    pm.expect(json.stats.average).to.be.a("number");
    pm.expect(json.stats.sum).to.be.a("number");
    pm.expect(json.stats.diagonalMatrices).to.be.an("object");
  });
  
  pm.test("Rotación none = matriz sin cambios", () => {
    pm.expect(json.rotated).to.eql(json.original);
  });
```

#### `POST QR con Rotación 90°`

```
POST {{go_api_url}}/api/v1/qr-factorization
Content-Type: application/json
Authorization: Bearer {{jwt_token}}

Body:
{
  "matrix": [
    [1, 2],
    [3, 4],
    [5, 6]
  ],
  "rotation": "clockwise_90"
}

Pre-request Script:
  // Asegurar que tenemos token
  if (!pm.environment.get("jwt_token")) {
    console.log("⚠️ Ejecutar POST Login primero");
  }

Test Script:
  pm.test("Status 200", () => pm.response.to.have.status(200));
  
  const json = pm.response.json();
  
  pm.test("Matriz 3x2 rotada 90° → 2x3", () => {
    pm.expect(json.original).to.have.lengthOf(3);
    pm.expect(json.original[0]).to.have.lengthOf(2);
    pm.expect(json.rotated).to.have.lengthOf(2);
    pm.expect(json.rotated[0]).to.have.lengthOf(3);
  });
  
  pm.test("Rotación 90° correcta: [[5,3,1],[6,4,2]]", () => {
    pm.expect(json.rotated).to.eql([[5, 3, 1], [6, 4, 2]]);
  });
```

#### `POST QR con Rotación 180°`

```
POST {{go_api_url}}/api/v1/qr-factorization
Content-Type: application/json
Authorization: Bearer {{jwt_token}}

Body:
{
  "matrix": [
    [1, 2],
    [3, 4],
    [5, 6]
  ],
  "rotation": "clockwise_180"
}

Test Script:
  pm.test("Status 200", () => pm.response.to.have.status(200));
  pm.test("Rotación 180° correcta: [[6,5],[4,3],[2,1]]", () => {
    const json = pm.response.json();
    pm.expect(json.rotated).to.eql([[6, 5], [4, 3], [2, 1]]);
  });
```

#### `POST QR con Transposición`

```
POST {{go_api_url}}/api/v1/qr-factorization
Content-Type: application/json
Authorization: Bearer {{jwt_token}}

Body:
{
  "matrix": [
    [1, 2, 3],
    [4, 5, 6]
  ],
  "rotation": "transpose"
}

Test Script:
  pm.test("Status 200", () => pm.response.to.have.status(200));
  pm.test("Transposición correcta: [[1,4],[2,5],[3,6]]", () => {
    const json = pm.response.json();
    pm.expect(json.rotated).to.eql([[1, 4], [2, 5], [3, 6]]);
  });
```

#### `POST QR con Volteo Horizontal`

```
POST {{go_api_url}}/api/v1/qr-factorization
Content-Type: application/json
Authorization: Bearer {{jwt_token}}

Body:
{
  "matrix": [
    [1, 2, 3],
    [4, 5, 6]
  ],
  "rotation": "horizontal_flip"
}

Test Script:
  pm.test("Status 200", () => pm.response.to.have.status(200));
  pm.test("Volteo horizontal correcto: [[3,2,1],[6,5,4]]", () => {
    const json = pm.response.json();
    pm.expect(json.rotated).to.eql([[3, 2, 1], [6, 5, 4]]);
  });
```

#### `POST QR con Volteo Vertical`

```
POST {{go_api_url}}/api/v1/qr-factorization
Content-Type: application/json
Authorization: Bearer {{jwt_token}}

Body:
{
  "matrix": [
    [1, 2, 3],
    [4, 5, 6]
  ],
  "rotation": "vertical_flip"
}

Test Script:
  pm.test("Status 200", () => pm.response.to.have.status(200));
  pm.test("Volteo vertical correcto: [[4,5,6],[1,2,3]]", () => {
    const json = pm.response.json();
    pm.expect(json.rotated).to.eql([[4, 5, 6], [1, 2, 3]]);
  });
```

#### `POST QR Matriz 3x3 (identidad)`

```
POST {{go_api_url}}/api/v1/qr-factorization
Content-Type: application/json
Authorization: Bearer {{jwt_token}}

Body:
{
  "matrix": [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ],
  "rotation": "none"
}

Test Script:
  pm.test("Status 200", () => pm.response.to.have.status(200));
  
  const json = pm.response.json();
  
  pm.test("QR de identidad: Q ≈ I, R ≈ I", () => {
    // Para una matriz identidad, Q ≈ I y R ≈ I
    pm.expect(json.Q[0][0]).to.be.closeTo(1, 0.001);
    pm.expect(json.R[0][0]).to.be.closeTo(1, 0.001);
  });
  
  pm.test("Matriz identidad es diagonal", () => {
    pm.expect(json.stats.diagonalMatrices.count).to.be.at.least(1);
  });
```

---

### 3.4 Estadísticas (Directo Node API)

#### `POST Stats con 2 matrices`

```
POST {{node_api_url}}/api/v1/stats
Content-Type: application/json
Authorization: Bearer {{jwt_token}}

Body:
{
  "matrices": [
    [[1, 2], [3, 4]],
    [[5, 6], [7, 8]]
  ]
}

Test Script:
  pm.test("Status 200", () => pm.response.to.have.status(200));
  
  const json = pm.response.json();
  
  pm.test("Estadísticas correctas para 2 matrices 2x2", () => {
    pm.expect(json.max).to.eql(8);
    pm.expect(json.min).to.eql(1);
    pm.expect(json.average).to.eql(4.5);
    pm.expect(json.sum).to.be.closeTo(36, 0.001);
    pm.expect(json.totalElements).to.eql(8);
    pm.expect(json.numberOfMatrices).to.eql(2);
  });
```

#### `POST Stats con 3 matrices`

```
POST {{node_api_url}}/api/v1/stats
Content-Type: application/json
Authorization: Bearer {{jwt_token}}

Body:
{
  "matrices": [
    [[0.169, 0.897], [0.507, 0.276], [0.845, -0.345]],
    [[5.916, 7.437], [0.000, 0.828]],
    [[5, 3, 1], [6, 4, 2]]
  ]
}

Test Script:
  pm.test("Status 200", () => pm.response.to.have.status(200));
  
  const json = pm.response.json();
  
  pm.test("numberOfMatrices = 3", () => {
    pm.expect(json.numberOfMatrices).to.eql(3);
  });
  
  pm.test("R triangular es identificada como diagonal", () => {
    pm.expect(json.diagonalMatrices.count).to.be.at.least(1);
    const rDiagonal = json.diagonalMatrices.matrices.find(
      m => m.name === "R (Upper Triangular)"
    );
    pm.expect(rDiagonal).to.exist;
  });
```

#### `POST Stats con matriz diagonal`

```
POST {{node_api_url}}/api/v1/stats
Content-Type: application/json
Authorization: Bearer {{jwt_token}}

Body:
{
  "matrices": [
    [[1, 0], [0, 2]],
    [[3, 0], [0, 4]]
  ]
}

Test Script:
  pm.test("Status 200", () => pm.response.to.have.status(200));
  
  const json = pm.response.json();
  
  pm.test("Ambas matrices son diagonales", () => {
    pm.expect(json.diagonalMatrices.count).to.eql(2);
  });
  
  pm.test("Estadísticas correctas", () => {
    pm.expect(json.max).to.eql(4);
    pm.expect(json.min).to.eql(0);
    pm.expect(json.sum).to.eql(10);
  });
```

---

### 3.5 Errores (Validaciones)

#### `POST Sin JWT (401)`

```
POST {{go_api_url}}/api/v1/qr-factorization
Content-Type: application/json

Body:
{
  "matrix": [[1, 2]],
  "rotation": "none"
}

Test Script:
  pm.test("Status 401", () => pm.response.to.have.status(401));
  
  pm.test("Código de error AUTH_MISSING_TOKEN", () => {
    const json = pm.response.json();
    pm.expect(json.code).to.match(/AUTH/);
  });
```

#### `POST Matriz vacía (400)`

```
POST {{go_api_url}}/api/v1/qr-factorization
Content-Type: application/json
Authorization: Bearer {{jwt_token}}

Body:
{
  "matrix": [],
  "rotation": "none"
}

Test Script:
  pm.test("Status 400", () => pm.response.to.have.status(400));
  
  pm.test("Mensaje indica matriz vacía", () => {
    const json = pm.response.json();
    pm.expect(json.error.toLowerCase()).to.include("empty");
  });
```

#### `POST Rotación inválida (400)`

```
POST {{go_api_url}}/api/v1/qr-factorization
Content-Type: application/json
Authorization: Bearer {{jwt_token}}

Body:
{
  "matrix": [[1, 2], [3, 4]],
  "rotation": "giro_magico"
}

Test Script:
  pm.test("Status 400", () => pm.response.to.have.status(400));
  
  pm.test("Lista rotaciones válidas en mensaje", () => {
    const json = pm.response.json();
    pm.expect(json.error.toLowerCase()).to.include("allowed");
    pm.expect(json.error).to.include("clockwise_90");
  });
```

#### `POST Matriz singular (422)`

```
POST {{go_api_url}}/api/v1/qr-factorization
Content-Type: application/json
Authorization: Bearer {{jwt_token}}

Body:
{
  "matrix": [
    [1, 2],
    [2, 4]
  ],
  "rotation": "none"
}

Test Script:
  pm.test("Status 422", () => pm.response.to.have.status(422));
  
  pm.test("Error de matriz singular", () => {
    const json = pm.response.json();
    pm.expect(json.error).to.include("rank");
  });
```

#### `POST Con strings en vez de números (400)`

```
POST {{go_api_url}}/api/v1/qr-factorization
Content-Type: application/json
Authorization: Bearer {{jwt_token}}

Body:
{
  "matrix": [
    ["hola", 2],
    [3, 4]
  ],
  "rotation": "none"
}

Test Script:
  pm.test("Status 400", () => pm.response.to.have.status(400));
  
  pm.test("Error indica valor no numérico", () => {
    const json = pm.response.json();
    pm.expect(json.error.toLowerCase()).to.match(/number|numb|numér/);
  });
```

#### `POST Stats sin matrices (400)`

```
POST {{node_api_url}}/api/v1/stats
Content-Type: application/json
Authorization: Bearer {{jwt_token}}

Body:
{
  "matrices": []
}

Test Script:
  pm.test("Status 400", () => pm.response.to.have.status(400));
  
  pm.test("Error indica array vacío", () => {
    const json = pm.response.json();
    pm.expect(json.error.toLowerCase()).to.include("empty");
  });
```

---

### 3.6 Flujo Completo E2E

#### `🔄 Login → QR → Stats`

**Descripción**: Ejecuta el flujo completo de la aplicación en secuencia.

```
POST {{go_api_url}}/api/v1/auth/login
Content-Type: application/json

Body:
{
  "username": "{{username}}",
  "password": "{{password}}"
}


||

POST {{go_api_url}}/api/v1/qr-factorization
Content-Type: application/json
Authorization: Bearer {{jwt_token}}

Body:
{
  "matrix": [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ],
  "rotation": "clockwise_90"
}
```

**Collection Runner:**
1. Ejecutar carpeta "Flujo Completo"
2. Orden: Login → QR Factorization
3. Verificar que todas las assertions pasan

---

## 4. Collection Variables (Pre-request)

```javascript
// Pre-request script global (se ejecuta en cada request)
if (pm.request.url.toString().includes("/qr-factorization")) {
  // Si no hay token, intentar login automáticamente
  if (!pm.environment.get("jwt_token")) {
    pm.sendRequest({
      url: pm.environment.get("go_api_url") + "/api/v1/auth/login",
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      body: {
        mode: 'raw',
        raw: JSON.stringify({
          username: pm.environment.get("username"),
          password: pm.environment.get("password")
        })
      }
    }, (err, res) => {
      if (!err && res.code === 200) {
        const token = res.json().token;
        pm.environment.set("jwt_token", token);
        console.log("✅ Token auto-generado");
      }
    });
  }
}
```

---

## 5. Cómo Usar

### 5.1 Importar en Postman

```
File → Import → Seleccionar docs/postman/interseguro-challenge.postman_collection.json
```

Las variables de entorno (`go_api_url`, `node_api_url`, `username`, `password`) vienen pre-configuradas en la coleccion para entorno local.

### 5.2 Ejecutar Pruebas

```bash
# Opción 1: Postman GUI
# Click en Collection → Run → Start Run

# Opción 2: Newman CLI
npm install -g newman
newman run docs/postman/interseguro-challenge.postman_collection.json \
  --environment docs/postman/interseguro-challenge.environment.json \
  --delay-request 500 \
  --reporters cli
```

### 5.3 Ejecutar en CI (GitHub Actions + Newman)

```yaml
- name: Postman Integration Tests
  run: |
    npm install -g newman
    newman run docs/postman/interseguro-challenge.postman_collection.json \
      --delay-request 500 \
      --reporters cli
```

---

## 6. Archivos

```
docs/postman/
├── interseguro-challenge.postman_collection.json   ← Coleccion (este archivo)
└── POSTMAN_COLLECTION.md                            ← Este documento
```

---

**Documento versión**: 1.0  
**Última actualización**: Junio 2024
