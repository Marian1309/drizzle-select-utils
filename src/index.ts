/**
 * @package drizzle-select-utils
 * A TypeScript utility package for enhanced Drizzle ORM operations with type-safe selectors
 * @author [Marian Pidchashyi]
 * @license MIT
 */
import type { InferSelectModel, SQL } from "drizzle-orm";
import { and, count } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

import validateFields from "./utils/validate-fields";

// ==============================
// Core Type Definitions
// ==============================

/**
 * Options for configuring database queries
 * @template T - The table type extending PgTable
 */
type QueryOptions<T extends PgTable> = {
  /** SQL conditions for WHERE clause */
  where?: SQL<unknown> | SQL<unknown>[];
  /** Pagination configuration */
  pagination?: {
    /** Maximum number of records to return */
    limit?: number;
    /** Number of records to skip */
    offset?: number;
  };
  /** SQL expressions for ORDER BY clause */
  orderBy?: SQL<unknown> | SQL<unknown>[];
  /** SQL expressions for GROUP BY clause */
  groupBy?: SQL<unknown> | SQL<unknown>[];
};

/**
 * Options for selecting specific fields
 * @template T - The table type extending PgTable
 * @template K - Array of field names
 */
type SelectOptions<
  T extends PgTable,
  K extends Readonly<(keyof InferSelectModel<T>)[]>
> = QueryOptions<T> & {
  /** Array of field names to include in the result */
  fields: K;
};

/**
 * Options for excluding specific fields
 * @template T - The table type extending PgTable
 * @template K - Array of field names
 */
type ExcludeOptions<
  T extends PgTable,
  K extends Readonly<(keyof InferSelectModel<T>)[]>
> = QueryOptions<T> & {
  /** Array of field names to exclude from the result */
  fields: K;
};

// ==============================
// Core Factory Function
// ==============================

/**
 * Creates a set of type-safe database selector utilities
 * @param database - The Drizzle database instance
 * @returns Object containing selector utility functions
 */
const createSelectorUtils = (database: any) => {
  /**
   * Selects only specified fields from a table
   * @template TTable - The table type extending PgTable
   * @template TFields - Array of field names to select
   * @param table - The table to select from
   * @param options - Query configuration options including fields to select
   * @returns Promise resolving to an array of records with only the specified fields
   */
  const selectOnly = async <
    TTable extends PgTable,
    TFields extends Readonly<(keyof InferSelectModel<TTable>)[]>
  >(
    table: TTable,
    options: SelectOptions<TTable, TFields>
  ): Promise<Array<Pick<InferSelectModel<TTable>, TFields[number]>>> => {
    validateFields(
      table,
      options.fields as unknown as (keyof InferSelectModel<TTable>)[],
      "select"
    );

    const columns = Object.entries(table).reduce<Record<string, unknown>>(
      (acc, [key, value]) => {
        if (
          options.fields.includes(key as keyof InferSelectModel<TTable>) &&
          key !== "_"
        ) {
          acc[key] = value;
        }
        return acc;
      },
      {}
    );

    let query = database.select(columns).from(table);

    if (options?.where) {
      const whereConditions: SQL<unknown>[] = Array.isArray(options.where)
        ? options.where
        : [options.where];
      const validConditions = whereConditions.filter(Boolean);
      if (validConditions.length > 0) {
        query = query.where(and(...validConditions));
      }
    }

    if (options?.groupBy) {
      const groupByExpressions: SQL<unknown>[] = Array.isArray(options.groupBy)
        ? options.groupBy
        : [options.groupBy];
      query = query.groupBy(...groupByExpressions);
    }

    if (options?.orderBy) {
      const orderByExpressions: SQL<unknown>[] = Array.isArray(options.orderBy)
        ? options.orderBy
        : [options.orderBy];
      query = query.orderBy(...orderByExpressions);
    }

    if (options?.pagination) {
      query = query
        .limit(options.pagination.limit ?? 25)
        .offset(options.pagination.offset ?? 0);
    }

    return await query.execute();
  };

  /**
   * Selects all fields except the specified ones from a table
   * @template TTable - The table type extending PgTable
   * @template TFields - Array of field names to exclude
   * @param table - The table to select from
   * @param options - Query configuration options including fields to exclude
   * @returns Promise resolving to an array of records without the excluded fields
   */
  const selectExcept = async <
    TTable extends PgTable,
    TFields extends Readonly<(keyof InferSelectModel<TTable>)[]>
  >(
    table: TTable,
    options: ExcludeOptions<TTable, TFields>
  ): Promise<Array<Omit<InferSelectModel<TTable>, TFields[number]>>> => {
    validateFields(
      table,
      options.fields as unknown as (keyof InferSelectModel<TTable>)[],
      "exclude"
    );

    const columns = Object.entries(table).reduce<Record<string, unknown>>(
      (acc, [key, value]) => {
        if (
          !options.fields.includes(key as keyof InferSelectModel<TTable>) &&
          key !== "_"
        ) {
          acc[key] = value;
        }
        return acc;
      },
      {}
    );

    let query = database.select(columns).from(table);

    if (options?.where) {
      const whereConditions: SQL<unknown>[] = Array.isArray(options.where)
        ? options.where
        : [options.where];
      const validConditions = whereConditions.filter(Boolean);
      if (validConditions.length > 0) {
        query = query.where(and(...validConditions));
      }
    }

    if (options?.groupBy) {
      const groupByExpressions: SQL<unknown>[] = Array.isArray(options.groupBy)
        ? options.groupBy
        : [options.groupBy];
      query = query.groupBy(...groupByExpressions);
    }

    if (options?.orderBy) {
      const orderByExpressions: SQL<unknown>[] = Array.isArray(options.orderBy)
        ? options.orderBy
        : [options.orderBy];
      query = query.orderBy(...orderByExpressions);
    }

    if (options?.pagination) {
      query = query
        .limit(options.pagination.limit ?? 10)
        .offset(options.pagination.offset ?? 0);
    }

    return await query.execute();
  };

  /**
   * Gets the count of records in a table
   * @template TTable - The table type extending PgTable
   * @param table - The table to count records from
   * @param options - Query configuration options (excluding pagination)
   * @returns Promise resolving to the count of records
   */
  const getCount = async <TTable extends PgTable>(
    table: TTable,
    options?: Omit<QueryOptions<TTable>, "pagination">
  ): Promise<number> => {
    let query = database.select({ value: count() }).from(table);

    if (options?.where) {
      const whereConditions: SQL<unknown>[] = Array.isArray(options.where)
        ? options.where
        : [options.where];
      const validConditions = whereConditions.filter(Boolean);
      if (validConditions.length > 0) {
        query = query.where(and(...validConditions));
      }
    }

    if (options?.orderBy) {
      const orderByExpressions: SQL<unknown>[] = Array.isArray(options.orderBy)
        ? options.orderBy
        : [options.orderBy];
      query = query.orderBy(...orderByExpressions);
    }

    const result = await query.execute();
    return Number(result[0]?.value ?? 0);
  };

  /**
   * Checks if records matching the conditions exist
   * @template TTable - The table type extending PgTable
   * @param table - The table to check
   * @param options - Query configuration options with where conditions
   * @returns Promise resolving to boolean indicating existence
   */
  const doesExist = async <TTable extends PgTable>(
    table: TTable,
    options: Pick<QueryOptions<TTable>, "where">
  ): Promise<boolean> => {
    if (!options.where) {
      throw new Error("Where condition is required for exists check");
    }

    const whereConditions: SQL<unknown>[] = Array.isArray(options.where)
      ? options.where
      : [options.where];

    const validConditions = whereConditions.filter(Boolean);
    if (validConditions.length === 0) {
      throw new Error(
        "At least one valid where condition is required for exists check"
      );
    }

    const query = database
      .select({ exists: database.sql<boolean>`exists(select 1)` })
      .from(table)
      .where(and(...validConditions))
      .limit(1);

    const result = await query.execute();
    return !!result[0];
  };

  return {
    selectOnly,
    selectExcept,
    getCount,
    doesExist,
  };
};

export default createSelectorUtils;
