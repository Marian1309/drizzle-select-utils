import type { InferSelectModel, SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
interface QueryOptions<T extends PgTable> {
    where?: SQL<unknown> | SQL<unknown>[];
    pagination?: {
        limit?: number;
        offset?: number;
    };
    orderBy?: SQL<unknown> | SQL<unknown>[];
}
export declare const createSelectorUtils: (database: any) => {
    selectOnly: <TTable extends PgTable, TFields extends Readonly<(keyof InferSelectModel<TTable>)[]>>(table: TTable, includeFields: TFields, options?: QueryOptions<TTable>) => Promise<Array<Pick<InferSelectModel<TTable>, TFields[number]>>>;
    selectExcept: <TTable extends PgTable, TFields extends Readonly<(keyof InferSelectModel<TTable>)[]>>(table: TTable, excludeFields: TFields, options?: QueryOptions<TTable>) => Promise<Array<Omit<InferSelectModel<TTable>, TFields[number]>>>;
    getCount: <TTable extends PgTable>(table: TTable, options?: Omit<QueryOptions<TTable>, "pagination">) => Promise<number>;
};
export {};
