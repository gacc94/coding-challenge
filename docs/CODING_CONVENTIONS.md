# Convenciones de Codigo y Style Guides

**Proyecto**: Coding Challenge Interseguro  
**Version**: 2.0 — Mayo 2026

---

## 1. Principios Generales

| Principio | Descripcion |
|---|---|
| **Coherencia** | Mismos patrones, nombres y estructuras en todo el monorepo |
| **Claridad** | Nombres descriptivos, funciones pequenas, una sola responsabilidad |
| **Documentacion** | Codigo auto-documentado + Swagger para APIs |
| **Testabilidad** | Todo servicio inyectable y testeable |
| **Seguridad** | Sin secretos hardcodeados, todo en variables de entorno |

---

## 2. Go API

### Nombres y Convenciones

| Elemento | Convencion | Ejemplo |
|---|---|---|
| Paquetes | lowercase, single word | `handlers`, `services`, `config` |
| Archivos | snake_case | `qr_handler.go`, `jwt_middleware.go` |
| Interfaces | PascalCase, sufijo `er` si accion | `MatrixValidator` |
| Structs | PascalCase | `QRService`, `Config` |
| Funciones exportadas | PascalCase | `Factorize()`, `NewNodeClient()` |
| Funciones no exportadas | camelCase | `validateMatrix()`, `deepCopy()` |
| Constantes | PascalCase o UPPER_SNAKE | `MaxRetries`, `DEFAULT_TIMEOUT` |
| Archivos test | `_test.go` sufijo | `qr_test.go`, `handlers_test.go` |

### Organizacion de Imports

Tres grupos separados por linea en blanco: standard library → third-party → internal packages.

### Manejo de Errores

- Errores descriptivos con contexto (`fmt.Errorf("row %d has %d elements, expected %d", i, len(row), cols)`)
- Nunca ignorar errores con `_`
- Usar `%w` para wrapping de errores
- Errores de negocio con codigos semanticos (`AUTH_INVALID_CREDENTIALS`, `QR_FACTORIZATION_ERROR`)

### Reglas

- `gofmt` antes de cada commit
- `go vet` antes de cada commit
- Prefer `:=` sobre declaracion explicita cuando sea posible
- Zero values en lugar de punteros para nil checks

---

## 3. Node API (TypeScript)

### Nombres y Convenciones

| Elemento | Convencion | Ejemplo |
|---|---|---|
| Archivos | kebab-case | `stats.service.ts`, `jwt.middleware.ts` |
| Clases | PascalCase | `StatsService`, `AuthController` |
| Interfaces | PascalCase | `StatsResponse`, `MatrixData` |
| Metodos publicos | camelCase | `calculateStats()`, `login()` |
| Metodos privados | camelCase | `analyzeMatrix()`, `isDiagonal()` |
| Constantes | UPPER_SNAKE | `MAX_RETRIES`, `DEFAULT_PORT` |
| Archivos test | `*.test.ts` sufijo | `stats.service.test.ts` |
| Schemas Zod | PascalCase + `Schema` | `StatsRequestSchema`, `LoginRequestSchema` |

### Inyeccion de Dependencias

Siempre por constructor. Los servicios reciben sus dependencias como parametros del constructor, nunca las instancian internamente. Esto permite mockeo facil en tests.

### Reglas TypeScript

- `strict: true` siempre activo
- `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters`
- `z.infer<typeof schema>` para inferir tipos desde Zod
- `Readonly<T>` para parametros inmutables
- `import type` para imports solo de tipos

---

## 4. Angular Frontend

### Nombres y Convenciones

| Elemento | Convencion | Ejemplo |
|---|---|---|
| Componentes | kebab-case archivo, PascalCase clase | `matrix-display.component.ts` → `MatrixDisplayComponent` |
| Servicios | kebab-case, PascalCase clase | `auth.service.ts` → `AuthService` |
| Guards | kebab-case, camelCase funcion | `auth.guard.ts` → `authGuard` |
| Interceptors | kebab-case, camelCase funcion | `auth.interceptor.ts` → `authInterceptor` |
| Interfaces | PascalCase | `MatrixData`, `StatsResponse` |
| Signals | camelCase | `matrix`, `rotation`, `isLoading` |
| Schemas Zod | PascalCase + `Schema` | `LoginRequestSchema` |

### Nomenclatura SCSS (BEM)

- Block: `.block-name`
- Element: `.block-name__element`
- Modifier: `.block-name--modifier` o `.block-name__element--modifier`
- Prohibido anidar por tag HTML o usar IDs
- Prohibido `!important`

### Reglas Angular

- Standalone components (no NgModules)
- Signals sobre RxJS para estado simple
- `OnPush` en todo componente
- `@if`/`@for`/`@switch` (nuevo control flow)
- `host: {}` en `@Component`, no `@HostBinding`
- `loadComponent()` para lazy loading
- Functional guards e interceptors
- `input.required()` para props obligatorias

---

## 5. Estructura de Commits

### Formato

```
<tipo>(<scope>): <descripcion breve>
```

### Tipos

| Tipo | Uso |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Correccion de bug |
| `docs` | Documentacion |
| `test` | Tests |
| `refactor` | Refactorizacion sin cambiar funcionalidad |
| `chore` | Mantenimiento |

### Scopes

| Scope | Proyecto |
|---|---|
| `go-api` | API Go |
| `node-api` | API Node.js |
| `frontend` | Angular Frontend |
| `docker` | Docker/Compose |
| `docs` | Documentacion |
| `ci` | GitHub Actions |

---

## 6. Formato de Codigo

| Lenguaje | Indentacion | Maximo por linea |
|---|---|---|
| Go | Tabs | 120 caracteres |
| TypeScript | 2 espacios | 120 caracteres |
| SCSS | 2 espacios | Sin limite estricto |
| YAML/Docker | 2 espacios | 120 caracteres |
| JSON | 2 espacios | Sin limite |

Cada archivo termina con una linea en blanco.

---

*Documento version 2.0 — Mayo 2026*
