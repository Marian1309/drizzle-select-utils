import type { InferSelectModel, SQL } from "drizzle-orm";
import { and, count } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

import validateFields from "./utils/validate-fields";

type QueryOptions<T extends PgTable> = {
  where?: SQL<unknown> | SQL<unknown>[];
  pagination?: {
    limit?: number;
    offset?: number;
  };
  orderBy?: SQL<unknown> | SQL<unknown>[];
};

const createSelectorUtils = (database: any) => {
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

  return { selectOnly, selectExcept, getCount };
};

export default createSelectorUtils;
