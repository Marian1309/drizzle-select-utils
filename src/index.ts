/**
 * @package @pidchashyi/drizzle-utils
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
   * @param includeFields - Array of field names to include in the result
   * @param options - Query configuration options
   * @returns Promise resolving to an array of records with only the specified fields
   */
  const selectOnly = async <
    TTable extends PgTable,
    TFields extends Readonly<(keyof InferSelectModel<TTable>)[]>
  >(
    table: TTable,
    includeFields: TFields,
    options?: QueryOptions<TTable>
  ): Promise<Array<Pick<InferSelectModel<TTable>, TFields[number]>>> => {
    validateFields(
      table,
      includeFields as unknown as (keyof InferSelectModel<TTable>)[],
      "select"
    );

    const columns = Object.entries(table).reduce<Record<string, unknown>>(
      (acc, [key, value]) => {
        if (
          includeFields.includes(key as keyof InferSelectModel<TTable>) &&
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
   * @param excludeFields - Array of field names to exclude from the result
   * @param options - Query configuration options
   * @returns Promise resolving to an array of records without the excluded fields
   */
  const selectExcept = async <
    TTable extends PgTable,
    TFields extends Readonly<(keyof InferSelectModel<TTable>)[]>
  >(
    table: TTable,
    excludeFields: TFields,
    options?: QueryOptions<TTable>
  ): Promise<Array<Omit<InferSelectModel<TTable>, TFields[number]>>> => {
    validateFields(
      table,
      excludeFields as unknown as (keyof InferSelectModel<TTable>)[],
      "exclude"
    );

    const columns = Object.entries(table).reduce<Record<string, unknown>>(
      (acc, [key, value]) => {
        if (
          !excludeFields.includes(key as keyof InferSelectModel<TTable>) &&
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
   * Selects all fields from a table
   * @template TTable - The table type extending PgTable
   * @param table - The table to select from
   * @param options - Query configuration options
   * @returns Promise resolving to an array of complete records
   */
  const selectAll = async <TTable extends PgTable>(
    table: TTable,
    options?: QueryOptions<TTable>
  ): Promise<Array<InferSelectModel<TTable>>> => {
    let query = database.select().from(table);

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
   * Selects a single record from a table
   * @template TTable - The table type extending PgTable
   * @param table - The table to select from
   * @param options - Query configuration options
   * @returns Promise resolving to a single record or undefined if not found
   */
  const selectOne = async <TTable extends PgTable>(
    table: TTable,
    options: QueryOptions<TTable>
  ): Promise<InferSelectModel<TTable> | undefined> => {
    const results = await selectAll(table, {
      ...options,
      pagination: { limit: 1 },
    });
    return results[0];
  };

  /**
   * Checks if records matching the conditions exist
   * @template TTable - The table type extending PgTable
   * @param table - The table to check
   * @param where - SQL conditions to match
   * @returns Promise resolving to boolean indicating existence
   */
  const exists = async <TTable extends PgTable>(
    table: TTable,
    where: SQL<unknown> | SQL<unknown>[]
  ): Promise<boolean> => {
    const query = database
      .select({ exists: database.sql<boolean>`exists(select 1)` })
      .from(table)
      .where(and(...(Array.isArray(where) ? where : [where])))
      .limit(1);

    const result = await query.execute();
    return !!result[0];
  };

  /**
   * Extracts a single field from matching records
   * @template TTable - The table type extending PgTable
   * @template K - The field key type
   * @param table - The table to select from
   * @param field - The field to extract
   * @param options - Query configuration options
   * @returns Promise resolving to an array of field values
   */
  const pluck = async <
    TTable extends PgTable,
    K extends keyof InferSelectModel<TTable>
  >(
    table: TTable,
    field: K,
    options?: QueryOptions<TTable>
  ): Promise<Array<InferSelectModel<TTable>[K]>> => {
    const rows = await selectOnly(table, [field] as const, options);
    return rows.map((row) => row[field]);
  };

  /**
   * Executes a raw SQL query
   * @template TResult - The expected result type
   * @param rawSql - The SQL query to execute
   * @returns Promise resolving to an array of results
   */
  const selectRaw = async <TResult>(
    rawSql: SQL<unknown>
  ): Promise<TResult[]> => {
    const result = await database.execute(rawSql);
    return result;
  };

  return {
    selectOnly,
    selectExcept,
    selectAll,
    selectOne,
    getCount,
    exists,
    pluck,
    selectRaw,
  };
};

export default createSelectorUtils;
