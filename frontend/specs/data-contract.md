# Contrato de datos — Dashboard financiero

## 1. Objetivo

Documentar los contratos entre el frontend y la API FastAPI para las funcionalidades de filtros de fechas, alertas de anomalías y comparación B2B/B2C.

Fuente de verificación: documentación OpenAPI disponible en `/docs` y `/openapi.json`.

Los tipos TypeScript están definidos en:
- `api-types.ts`
- `param-types.ts`

## 2. Convenciones generales

- Las fechas se representan como cadenas `YYYY-MM-DD`.
- Los parámetros de consulta son opcionales salvo indicación contraria.
- Los importes financieros son números.
- Los endpoints devuelven JSON.
- Las respuestas de alertas y categorías son arrays directos.
- Los errores de validación de parámetros pueden devolver HTTP 422.
- No se deben inventar propiedades que no estén definidas en OpenAPI.

## 3. GET /api/metrics/facets

### Parámetros

No recibe parámetros.

### Respuesta HTTP 200

Objeto `MetricsFacets`:

| Campo | Tipo | Descripción |
|---|---|---|
| operation_types | OperationType[] | Tipos de operación disponibles |
| business_types | BusinessType[] | Líneas de negocio disponibles |
| categories | FinancialCategory[] | Categorías disponibles |
| min_date | string | Fecha mínima disponible |
| max_date | string | Fecha máxima disponible |

Todos los campos son obligatorios.

### Valores verificados

- OperationType: `income`, `outcome`.
- BusinessType: `B2B`, `B2C`.
- FinancialCategory: `suppliers`, `sales`, `operational`, `administrative`, `others`.

Las fechas disponibles deben obtenerse de la API, sin fijarlas permanentemente en el frontend.

## 4. GET /api/metrics

### Parámetros opcionales

| Parámetro | Tipo | Descripción |
|---|---|---|
| start_date | string | Fecha inicial |
| end_date | string | Fecha final |
| category | FinancialCategory | Categoría |
| operation_type | OperationType | Tipo de operación |

### Respuesta HTTP 200

Array de objetos `FinancialMovement`.

El modelo existente en `src/lib/financial-types.ts` define:

- `create_date: string`
- `amount: number`
- `operation_type: OperationType`
- `category: Category`
- `business_type: BusinessType`

La respuesta permite recalcular los indicadores y gráficos mediante las funciones existentes `computeKPIs` y `computeMonthlyData`.

### Relación con filtros de fechas

El frontend enviará `start_date` y `end_date` cuando exista un rango válido.

Si no se seleccionan fechas, ambos parámetros pueden omitirse.

## 5. GET /api/metrics/alerts

### Parámetros

| Parámetro | Tipo | Valor predeterminado |
|---|---|---|
| threshold | number | 0.3 |
| group_by | day / week / month | month |
| start_date | string opcional | Sin valor |
| end_date | string opcional | Sin valor |
| business_type | B2B / B2C | Sin valor |

OpenAPI establece `threshold >= 0`.

La interfaz solicitada utiliza una validación más restrictiva: valores entre `0.01` y `1.0`.

### Respuesta HTTP 200

Array `MetricsAlert[]`.

Cada elemento contiene:

| Campo | Tipo | Descripción |
|---|---|---|
| period | string | Período analizado |
| outcome_total | number | Egreso total |
| baseline_average | number | Promedio de referencia |
| increase_ratio | number | Incremento proporcional |

Todos los campos son obligatorios.

### Presentación

Para mostrar el incremento porcentual:

`increase_ratio * 100`

Por ejemplo, una proporción de `0.3` equivale a un incremento del `30%`.

### Estados especiales

- Array vacío: no existen alertas para los filtros seleccionados.
- HTTP 422: parámetros inválidos.
- Error de red: mostrar mensaje de error y permitir reintentar.

## 6. GET /api/metrics/categories/top

### Parámetros

| Parámetro | Tipo | Valor predeterminado |
|---|---|---|
| operation_type | income / outcome | outcome |
| limit | integer | 5 |
| start_date | string opcional | Sin valor |
| end_date | string opcional | Sin valor |
| business_type | B2B / B2C | Sin valor |

El parámetro `limit` acepta valores entre 1 y 20.

### Respuesta HTTP 200

Array `TopCategoryItem[]`.

Cada elemento contiene:

| Campo | Tipo | Descripción |
|---|---|---|
| category | FinancialCategory | Categoría financiera |
| operation_type | OperationType | Tipo de operación |
| total_amount | number | Importe total |

Todos los campos son obligatorios.

### Comparación B2B vs. B2C

Para comparar ambas líneas se requieren consultas diferenciadas:

`GET /api/metrics/categories/top?business_type=B2B&operation_type=income&limit=5`

`GET /api/metrics/categories/top?business_type=B2C&operation_type=income&limit=5`

La propiedad `business_type` no forma parte de cada elemento de respuesta.

El frontend debe conservar la asociación entre cada resultado y el filtro utilizado en su consulta.

No debe suponerse que ambas consultas devuelven las mismas categorías ni la misma cantidad de registros.

Las categorías ausentes deben tratarse explícitamente, sin inventar importes.

## 7. Reglas de validación

### Fechas

- Formato `YYYY-MM-DD`.
- La fecha inicial no puede ser posterior a la final.
- Respetar el rango obtenido desde `/api/metrics/facets`.
- No ejecutar consultas con fechas inválidas.

### Alertas

- Umbral inicial: `0.3`.
- Rango permitido por la interfaz: `0.01` a `1.0`.
- Agrupación inicial: `month`.

### Categorías

- Límite inicial: `5`.
- Rango permitido: `1` a `20`.
- Líneas de negocio: `B2B` y `B2C`.
- Tipos de operación: `income` y `outcome`.

## 8. Manejo de respuestas

Los componentes deberán contemplar:

- Carga inicial.
- Datos disponibles.
- Respuestas vacías.
- Errores de validación.
- Errores de conexión.
- Actualización de datos al cambiar filtros.

No se implementan componentes React ni nuevas llamadas HTTP en esta entrega.

## 9. Verificación

Los contratos se contrastaron con los esquemas OpenAPI:

- `MetricsFacets`
- `MetricsAlert`
- `TopCategoryItem`

Los tipos de parámetros corresponden a los endpoints reales.

La comprobación de TypeScript debe ejecutarse desde `frontend`:

`npx tsc --noEmit -p tsconfig.app.json`

La entrega se realiza en la rama `feature/frontend-specs`.
