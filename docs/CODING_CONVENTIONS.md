# Convenciones de Código y Style Guides

**Proyecto**: Coding Challenge Interseguro  
**Última actualización**: Junio 2024

---

## 1. Principios Generales

| Principio | Descripción |
|-----------|-------------|
| **Coherencia** | Mismos patrones, nombres y estructuras en todo el monorepo |
| **Claridad** | Nombres descriptivos, funciones pequeñas, una sola responsabilidad |
| **Documentación** | Código auto-documentado + Swagger para APIs |
| **Testabilidad** | Todo servicio debe ser inyectable/testeable |
| **Seguridad** | No hardcodear secretos, usar variables de entorno |

---

## 2. Go API - Style Guide

### 2.1 Nombres y Convenciones

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Paquetes | lowercase, single word | `qr`, `rotation`, `handlers` |
| Archivos | snake_case | `qr_handler.go`, `jwt_middleware.go` |
| Interfaces | PascalCase, sufijo `er` si describe acción | `MatrixValidator`, `StatsFetcher` |
| Structs | PascalCase | `QRService`, `RotationRequest` |
| Funciones exportadas | PascalCase | `Factorize()`, `NewNodeClient()` |
| Funciones no exportadas | camelCase | `validateMatrix()`, `applyRotation()` |
| Variables locales | camelCase | `matrixRows`, `totalElements` |
| Constantes | PascalCase o UPPER_SNAKE (global) | `MaxRetries`, `DEFAULT_TIMEOUT` |
| Archivos test | `_test.go` sufijo | `qr_test.go`, `handlers_test.go` |
| Variables de entorno | UPPER_SNAKE | `NODE_API_URL`, `JWT_SECRET` |

### 2.2 Estructura de Archivos

```go
package handlers

import (
    "fmt"
    "log"
    
    "github.com/gofiber/fiber/v3"
    "go-api/internal/models"
    "go-api/internal/services"
)

// qrHandler maneja las peticiones de factorización QR
type qrHandler struct {
    qrService services.QRService
}

// newQRHandler crea una nueva instancia de qrHandler
func newQRHandler(qrService services.QRService) *qrHandler {
    return &qrHandler{
        qrService: qrService,
    }
}

// handleFactorization procesa la petición de factorización QR
// @Summary Factorización QR con rotación
// @Tags QR
func (h *qrHandler) handleFactorization(c *fiber.Ctx) error {
    var req models.FactorizationRequest
    
    if err := c.BodyParser(&req); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
            Error: "Invalid JSON format: " + err.Error(),
            Code:  "VALIDATION_ERROR",
        })
    }
    
    result, err := h.qrService.ProcessMatrix(req.Matrix, req.Rotation)
    if err != nil {
        log.Printf("QR factorization error: %v", err)
        return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
            Error: err.Error(),
            Code:  "QR_FACTORIZATION_ERROR",
        })
    }
    
    return c.Status(fiber.StatusOK).JSON(result)
}
```

### 2.3 Reglas Go

| Regla | Descripción |
|-------|-------------|
| `gofmt` | Siempre formatear antes de commit |
| `go vet` | Ejecutar antes de cada commit |
| `golint` | Usar para detectar malas prácticas |
| Error handling | Nunca ignorar errores con `_` |
| Prefer `:=` | Usar declaración corta cuando sea posible |
| Zero value | Usar zero values en lugar de punteros para nil checks |
| Context | Pasar `context.Context` como primer parámetro |

### 2.4 Manejo de Errores

```go
// ✅ Correcto: errores descriptivos con contexto
func ValidateMatrix(matrix [][]float64) error {
    if len(matrix) == 0 {
        return fmt.Errorf("matrix cannot be empty")
    }
    
    cols := len(matrix[0])
    for i, row := range matrix {
        if len(row) != cols {
            return fmt.Errorf("row %d has %d elements, expected %d", i, len(row), cols)
        }
    }
    return nil
}

// ❌ Incorrecto: errores genéricos sin contexto
func ValidateMatrix(matrix [][]float64) error {
    if len(matrix) == 0 {
        return errors.New("invalid")
    }
    return nil
}
```

### 2.5 Organización de Imports

```go
import (
    // 1. Standard library
    "fmt"
    "log"
    "net/http"
    "os"
    
    // 2. Third-party
    "github.com/gofiber/fiber/v3"
    "github.com/go-resty/resty/v2"
    "gonum.org/v1/gonum/mat"
    
    // 3. Internal packages
    "go-api/internal/config"
    "go-api/internal/models"
)
```

---

## 3. Node.js API - Style Guide

### 3.1 Nombres y Convenciones

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Archivos | kebab-case | `stats.service.ts`, `jwt.middleware.ts` |
| Clases | PascalCase | `StatsService`, `AuthController`, `AppRoutes` |
| Interfaces | PascalCase, prefijo `I` opcional | `StatsResponse`, `MatrixData` |
| Métodos públicos | camelCase | `calculateStats()`, `findMax()` |
| Métodos privados | camelCase | `analyzeMatrix()`, `isDiagonal()` |
| Propiedades privadas | camelCase, prefijo `_` | `_token`, `_config` |
| Constantes | UPPER_SNAKE | `MAX_RETRIES`, `DEFAULT_PORT` |
| Enums | PascalCase | `RotationType`, `MatrixStatus` |
| Archivos test | `*.test.ts` sufijo | `stats.service.test.ts` |
| Schemas Zod | PascalCase + `Schema` sufijo | `StatsRequestSchema`, `LoginSchema` |

### 3.2 Estructura de Clases

```typescript
// stats.service.ts
import { StatsResponse, MatrixArray } from '../types/matrix.types';

/**
 * Servicio para cálculo de estadísticas sobre matrices.
 * 
 * @remarks
 * Soporta múltiples matrices (Q, R, rotated) y verifica matrices diagonales.
 */
export class StatsService {
  /**
   * Calcula estadísticas globales sobre un array de matrices.
   * 
   * @param matrices - Array de matrices 2D para analizar
   * @returns Estadísticas calculadas (max, min, average, sum, diagonals)
   * @throws {StatsError} Si el array está vacío
   * 
   * @example
   * ```typescript
   * const service = new StatsService();
   * const stats = service.calculateStats([[[1,2],[3,4]], [[5,6],[7,8]]]);
   * console.log(stats.max); // 8
   * ```
   */
  public calculateStats(matrices: MatrixArray): StatsResponse {
    let globalMax = -Infinity;
    let globalMin = Infinity;
    let globalSum = 0;
    let totalElements = 0;
    const diagonalMatrices: DiagonalMatrixInfo[] = [];

    matrices.forEach((matrix, index) => {
      const { max, min, sum, elements, isDiagonal } = this.analyzeMatrix(matrix);
      
      globalMax = Math.max(globalMax, max);
      globalMin = Math.min(globalMin, min);
      globalSum += sum;
      totalElements += elements;

      if (isDiagonal) {
        diagonalMatrices.push({
          matrixIndex: index,
          name: this.getMatrixName(index),
          dimensions: `${matrix.length}x${matrix[0].length}`,
        });
      }
    });

    return {
      max: globalMax,
      min: globalMin,
      average: totalElements > 0 ? globalSum / totalElements : 0,
      sum: globalSum,
      totalElements,
      numberOfMatrices: matrices.length,
      diagonalMatrices: { count: diagonalMatrices.length, matrices: diagonalMatrices },
    };
  }

  private analyzeMatrix(matrix: number[][]): MatrixStats {
    let max = -Infinity;
    let min = Infinity;
    let sum = 0;
    let elements = 0;

    for (const row of matrix) {
      for (const value of row) {
        max = Math.max(max, value);
        min = Math.min(min, value);
        sum += value;
        elements++;
      }
    }

    return { max, min, sum, elements, isDiagonal: this.isDiagonal(matrix) };
  }

  private isDiagonal(matrix: number[][], tolerance = 1e-10): boolean {
    const n = matrix.length;
    if (!matrix.every((row, i) => row.length === n)) return false;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j && Math.abs(matrix[i][j]) > tolerance) return false;
      }
    }
    return true;
  }

  private getMatrixName(index: number): string {
    const names = ['Q (Orthogonal)', 'R (Upper Triangular)', 'Rotated Matrix'];
    return names[index] ?? `Matrix ${index + 1}`;
  }
}
```

### 3.3 Inyección de Dependencias

```typescript
// ✅ Correcto: Inyección por constructor
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  async calculate(req: Request, res: Response): Promise<void> {
    const result = this.statsService.calculateStats(req.body.matrices);
    res.json(result);
  }
}

// ❌ Incorrecto: Instanciación directa
export class StatsController {
  private statsService = new StatsService();

  async calculate(req: Request, res: Response): Promise<void> {
    const result = this.statsService.calculateStats(req.body.matrices);
    res.json(result);
  }
}
```

### 3.4 Reglas TypeScript

| Regla | Descripción |
|-------|-------------|
| `strict: true` | Siempre activo en tsconfig.json |
| `noImplicitAny` | Prohibir any implícito |
| `strictNullChecks` | Manejar null/undefined explícitamente |
| `noUnusedLocals` | Sin variables sin usar |
| `noUnusedParameters` | Sin parámetros sin usar |
| `as const` | Preferir sobre enums para strings literales |
| `Readonly<T>` | Usar para parámetros inmutables |
| `z.infer<typeof>` | Inferir tipos desde Zod en lugar de declararlos manualmente |
| `eslint` | Configurar con `@typescript-eslint` |

---

## 4. Angular 21 Frontend - Style Guide

### 4.1 Nombres y Convenciones

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Componentes | kebab-case archivo, PascalCase clase | `matrix-display.component.ts` → `MatrixDisplayComponent` |
| Servicios | kebab-case archivo, PascalCase clase | `auth.service.ts` → `AuthService` |
| Guards | kebab-case archivo, PascalCase función | `auth.guard.ts` → `authGuard` |
| Interceptors | kebab-case archivo, camelCase función | `auth.interceptor.ts` → `authInterceptor` |
| Interfaces | PascalCase | `MatrixData`, `StatsResponse` |
| Signals | camelCase | `matrix`, `rotation`, `isLoading` |
| Métodos públicos | camelCase | `calculate()`, `onSubmit()` |
| Métodos privados | camelCase | `validateInput()` |

### 4.2 Estructura de Componentes

```typescript
import {
  Component,
  input,
  output,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'app-matrix-display',
  standalone: true,
  imports: [/* Material modules */],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'matrix-display',
    '[class.highlight]': 'highlight()',
  },
  template: `
    @if (title()) {
      <h3>{{ title() }}</h3>
    }
    <table>
      @for (row of data(); track $index) {
        <tr>
          @for (value of row; track $index) {
            <td>{{ value | number:'1.0-4' }}</td>
          }
        </tr>
      }
    </table>
  `,
  styles: `
    :host { display: block; margin: 8px 0; }
    :host(.highlight) td { background: rgba(30, 136, 229, 0.1); }
    td { padding: 8px 12px; border: 1px solid rgba(255,255,255,0.12); text-align: center; }
  `,
})
export class MatrixDisplayComponent {
  /** Datos de la matriz a mostrar (required) */
  data = input.required<number[][]>();

  /** Título opcional sobre la tabla */
  title = input<string>('');

  /** Resaltar celdas con color de fondo */
  highlight = input(false, { transform: booleanAttribute });
}
```

### 4.3 Reglas Angular

| Regla | Descripción |
|-------|-------------|
| Standalone | Todos los componentes standalone (no NgModules) |
| Signals | Preferir signals sobre RxJS para estado simple |
| httpResource | Usar para fetch de datos (no HttpClient manual) |
| OnPush | Siempre `ChangeDetectionStrategy.OnPush` |
| OnPush (CD) | Siempre activado en todos los componentes |
| Host bindings | Usar `host: {}` en @Component, no @HostBinding |
| Control flow | Usar `@if`/`@for`/`@switch`, no `*ngIf`/`*ngFor` |
| Lazy loading | Todas las features con `loadComponent()` |
| SCSS | Estilos con `_variables.scss` y `_mixins.scss` compartidos |
| Accessibility | ARIA labels, roles, keyboard support en todos los componentes |

### 4.4 Nomenclatura de Archivos SCSS

```
styles/
├── _variables.scss       # Variables globales: colores, tamaños, breakpoints
├── _mixins.scss          # Mixins reutilizables: responsive, flex, grid
├── _theme.scss           # Tema Angular Material (M3)
└── styles.scss           # Estilos globales: resets, tipografía base

// Dentro de cada componente:
matrix-display.component.scss   # Estilos específicos del componente
login.component.scss            # Estilos encapsulados
```

---

## 5. Estructura de Commits

### Formato

```
<tipo>(<scope>): <descripción breve>

[descripción detallada opcional]
```

### Tipos

| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Documentación |
| `test` | Tests |
| `refactor` | Refactorización sin cambiar funcionalidad |
| `chore` | Tareas de mantenimiento |
| `style` | Cambios de formato/estilo |

### Scopes

| Scope | Proyecto |
|-------|----------|
| `go-api` | API Go |
| `node-api` | API Node.js |
| `frontend` | Angular Frontend |
| `docker` | Docker/Compose |
| `docs` | Documentación |
| `ci` | GitHub Actions |

### Ejemplos

```
feat(go-api): add QR factorization with gonum Householder method
fix(node-api): correct diagonal matrix detection with floating point tolerance
docs(frontend): add Swagger integration specification
test(go-api): add rotation unit tests for all 7 types
chore(docker): update Go base image to 1.23-alpine
```

---

## 6. Tabs vs Espacios

| Lenguaje | Indentación | Tamaño |
|----------|------------|--------|
| Go | Tabs | 1 tab |
| TypeScript | Espacios | 2 espacios |
| SCSS | Espacios | 2 espacios |
| YAML/Docker | Espacios | 2 espacios |
| JSON | Espacios | 2 espacios |
| Markdown | Sin restricción | - |

---

## 7. Línea de separación

Cada archivo termina con **una línea en blanco** al final.

---

## 8. Máximo por línea

| Lenguaje | Máximo |
|----------|--------|
| Go | 120 caracteres |
| TypeScript | 120 caracteres |
| SCSS | Sin límite estricto |
| Markdown | Sin límite estricto |

---

## A. Referencias

- [Effective Go](https://go.dev/doc/effective_go)
- [Uber Go Style Guide](https://github.com/uber-go/guide)
- [Angular Style Guide](https://angular.dev/style-guide)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
