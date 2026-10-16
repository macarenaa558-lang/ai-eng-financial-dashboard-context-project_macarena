# Especificaciones de componentes — Dashboard financiero

## Objetivo

Definir el comportamiento, las propiedades, los estados y los criterios de aceptación de tres funcionalidades del dashboard financiero.

Este documento es una especificación. No incluye implementación de componentes React ni nuevas llamadas a la API.

## Contexto existente

El dashboard utiliza React, TypeScript y Tailwind CSS.

En `src/App.tsx` se consultan los movimientos financieros mediante `GET /api/metrics`, y se calculan indicadores y gráficos utilizando `computeKPIs` y `computeMonthlyData`.

Componentes existentes:
- `DashboardHeader`: encabezado y período.
- `KPIRow`: indicadores financieros.
- `IncomeOutcomeChart`: gráfico de ingresos y egresos.
- `ProfitPercentChart`: gráfico de porcentaje de beneficio.

Las funcionalidades nuevas deben respetar esta estructura.

---

## 1. Filtro de fechas — DateRangeFilter

### Objetivo

Permitir seleccionar un período de análisis para actualizar los indicadores y gráficos financieros.

### Ubicación

Debajo de `DashboardHeader` y antes de los indicadores KPI.

### Propiedades propuestas

- `value: DateRangeFilter`: fechas seleccionadas.
- `minDate: string`: fecha mínima disponible.
- `maxDate: string`: fecha máxima disponible.
- `onChange: (value: DateRangeFilter) => void`: comunica cambios.
- `disabled?: boolean`: deshabilita los controles.

### Comportamiento

1. Obtener las fechas disponibles mediante `GET /api/metrics/facets`.
2. Mostrar controles para fecha inicial y final.
3. Utilizar fechas en formato `YYYY-MM-DD`.
4. Validar que la fecha inicial no sea posterior a la final.
5. Validar que las fechas estén dentro del rango disponible.
6. Permitir limpiar los filtros.
7. Al aplicar un rango válido, actualizar la consulta a `GET /api/metrics`.
8. Enviar los parámetros `start_date` y `end_date`.
9. Recalcular los KPI y gráficos con los movimientos filtrados.
10. Actualizar el período mostrado en el encabezado.

### Estados

- Inicial: sin fechas seleccionadas.
- Cargando: consultando datos.
- Válido: rango seleccionado correctamente.
- Inválido: fechas inconsistentes o fuera del rango disponible.
- Error: fallo al consultar la API.
- Vacío: período sin movimientos financieros.

### Criterios de aceptación

- Se pueden seleccionar y limpiar ambas fechas.
- No se permite aplicar un rango inválido.
- Los parámetros enviados coinciden con OpenAPI.
- Los indicadores y gráficos reflejan el período seleccionado.
- Se informa cuando no existen resultados.
- No se realizan consultas mientras el rango es inválido.

---

## 2. Tabla de alertas — AnomalyAlertsTable

### Objetivo

Mostrar períodos con incrementos anómalos en los egresos financieros.

### Ubicación

Debajo de los gráficos financieros.

### Propiedades propuestas

- `alerts: AlertsResponse`: alertas recibidas.
- `threshold: number`: umbral seleccionado.
- `onThresholdChange: (value: number) => void`: comunica cambios.
- `loading?: boolean`: indica carga.
- `error?: string | null`: mensaje de error.

### Comportamiento

1. Consultar `GET /api/metrics/alerts`.
2. Utilizar `threshold=0.3` como valor inicial.
3. Permitir configurar el umbral entre `0.01` y `1.0`.
4. Validar el umbral antes de realizar una consulta.
5. Mostrar una tabla con las columnas:
   - Período.
   - Gasto total.
   - Promedio de referencia.
   - Incremento porcentual.
6. Utilizar los campos reales:
   - `period`
   - `outcome_total`
   - `baseline_average`
   - `increase_ratio`
7. Mostrar `increase_ratio * 100` como porcentaje.
8. Permitir actualizar los resultados al modificar el umbral.
9. Considerar filtros opcionales de fechas y línea de negocio.
10. Utilizar `group_by=month` inicialmente.

### Validaciones

La interfaz acepta valores entre `0.01` y `1.0`.

OpenAPI establece que la API acepta valores desde `0`, sin máximo declarado. El rango de la interfaz es una regla funcional adicional y no debe confundirse con la validación del backend.

### Estados

- Cargando alertas.
- Alertas disponibles.
- Sin alertas para los filtros seleccionados.
- Umbral inválido.
- Error de conexión o respuesta.

### Criterios de aceptación

- La tabla muestra los cuatro campos reales.
- El umbral inicial es `0.3`.
- Se rechazan valores fuera del rango permitido por la interfaz.
- Cambiar el umbral actualiza las alertas.
- El porcentaje se presenta correctamente.
- Los estados de carga, error y ausencia de resultados están documentados.

---

## 3. Comparación B2B vs. B2C — BusinessComparison

### Objetivo

Comparar los importes financieros correspondientes a las líneas de negocio B2B y B2C.

### Ubicación

En una sección adicional debajo de los gráficos principales.

### Propiedades propuestas

- `businessType: BusinessType | null`: selección de línea de negocio.
- `operationType: OperationType`: tipo de operación.
- `limit: number`: máximo de categorías.
- `dateRange: DateRangeFilter`: rango seleccionado.
- `onBusinessTypeChange: (value: BusinessType | null) => void`: comunica cambios.

### Comportamiento

1. Permitir seleccionar B2B, B2C o ambas líneas para comparar.
2. Consultar `GET /api/metrics/categories/top`.
3. Utilizar `business_type=B2B` y `business_type=B2C` en consultas separadas cuando se requiera una comparación simultánea.
4. Utilizar `operation_type=income` para comparar ingresos.
5. Permitir comparar egresos con `operation_type=outcome`.
6. Utilizar `limit=5` inicialmente.
7. Respetar el rango permitido por la API: entre 1 y 20 categorías.
8. Aplicar los filtros opcionales `start_date` y `end_date`.
9. Mostrar los importes por categoría y línea de negocio.
10. Mostrar diferencias absolutas entre B2B y B2C cuando existan datos comparables.

### Contrato de datos

Cada registro de categorías contiene:
- `category`
- `operation_type`
- `total_amount`

La API no devuelve una propiedad `business_type` dentro de `TopCategoryItem`.

Por lo tanto, la interfaz debe identificar la línea de negocio a partir del filtro utilizado en cada consulta, sin asumir que forma parte de la respuesta.

La API puede devolver menos registros que el valor de `limit`.

### Estados

- Cargando comparación.
- Datos disponibles.
- Una línea de negocio sin resultados.
- Ambas líneas sin resultados.
- Error al consultar una o ambas líneas.

### Criterios de aceptación

- Se pueden comparar B2B y B2C.
- Se utilizan los valores exactos `B2B` y `B2C`.
- Los parámetros enviados coinciden con OpenAPI.
- Se distinguen claramente ambas líneas.
- No se inventan categorías ni importes faltantes.
- Se muestran correctamente los estados vacíos y de error.

---

## Consideraciones generales

- Mantener consistencia con el diseño existente.
- Utilizar los tipos definidos en `api-types.ts` y `param-types.ts`.
- No utilizar `any`.
- Respetar los nombres de parámetros de OpenAPI.
- Mantener accesibilidad mediante etiquetas y mensajes claros.
- Documentar estados de carga, error y ausencia de datos.
- No implementar componentes ni modificar endpoints en esta entrega.
