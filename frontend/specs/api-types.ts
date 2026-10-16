/** Tipo de operación financiera admitido por la API. */
export type OperationType = "income" | "outcome";

/** Línea de negocio admitida por la API. */
export type BusinessType = "B2B" | "B2C";

/** Categorías financieras admitidas por la API. */
export type FinancialCategory =
  | "suppliers"
  | "sales"
  | "operational"
  | "administrative"
  | "others";

/** Respuesta de GET /api/metrics/facets. */
export interface FacetsResponse {
  /** Tipos de operación disponibles. */
  operation_types: OperationType[];

  /** Líneas de negocio disponibles. */
  business_types: BusinessType[];

  /** Categorías financieras disponibles. */
  categories: FinancialCategory[];

  /** Fecha más antigua disponible, formato YYYY-MM-DD. */
  min_date: string;

  /** Fecha más reciente disponible, formato YYYY-MM-DD. */
  max_date: string;
}

/** Una alerta devuelta por GET /api/metrics/alerts. */
export interface AlertEntry {
  /** Período analizado; con group_by=month, formato YYYY-MM. */
  period: string;

  /** Gasto total registrado durante el período. */
  outcome_total: number;

  /** Promedio de referencia de los períodos anteriores. */
  baseline_average: number;

  /** Proporción de incremento respecto del promedio. */
  increase_ratio: number;
}

/** Respuesta de alertas: la API devuelve directamente un array. */
export type AlertsResponse = AlertEntry[];

/** Una categoría devuelta por GET /api/metrics/categories/top. */
export interface CategoryEntry {
  /** Categoría financiera. */
  category: FinancialCategory;

  /** Tipo de operación financiera. */
  operation_type: OperationType;

  /** Importe total correspondiente a la categoría. */
  total_amount: number;
}

/** Respuesta de categorías: la API devuelve directamente un array. */
export type TopCategoriesResponse = CategoryEntry[];
