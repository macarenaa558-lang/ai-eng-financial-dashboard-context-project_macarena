import type { BusinessType, OperationType } from "./api-types";

/** Filtros opcionales de fechas utilizados por la API. */
export interface DateRangeFilter {
  /** Fecha inicial inclusiva, formato YYYY-MM-DD. */
  start_date?: string;

  /** Fecha final inclusiva, formato YYYY-MM-DD. */
  end_date?: string;
}

/** Parámetros de GET /api/metrics/alerts. */
export interface AlertsParams extends DateRangeFilter {
  /**
   * Umbral de incremento como proporción.
   * La UI admite valores entre 0.01 y 1.0.
   * Valor predeterminado: 0.3.
   * La API acepta valores desde 0.
   */
  threshold?: number;

  /** Agrupación temporal; por defecto, month. */
  group_by?: "day" | "week" | "month";

  /** Filtro opcional de línea de negocio. */
  business_type?: BusinessType;
}

/** Parámetros de GET /api/metrics/categories/top. */
export interface TopCategoriesParams extends DateRangeFilter {
  /** Tipo de operación; para comparar ingresos se utiliza income. */
  operation_type?: OperationType;

  /** Cantidad máxima de categorías, entre 1 y 20; por defecto, 5. */
  limit?: number;

  /** Línea de negocio: B2B o B2C. */
  business_type?: BusinessType;
}
