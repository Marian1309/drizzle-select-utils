import { and, count } from "drizzle-orm";
const toSnakeCase = (str) => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
const validateFields = (table, fields, operation = "select") => {
    const duplicates = fields.filter((field, index) => fields.indexOf(field) !== index);
    if (duplicates.length > 0) {
        throw new Error(`Duplicate fields found in ${operation} operation: ${duplicates.join(", ")}`);
    }
    const invalidFields = fields.filter((field) => !(field in table) || field === "_");
    if (invalidFields.length > 0) {
        throw new Error(`Invalid fields for table: ${invalidFields.join(", ")}. ` +
            `Available fields: ${Object.keys(table)
                .filter((k) => k !== "_")
                .join(", ")}`);
    }
};
export const createSelectorUtils = (database) => {
    const selectOnly = async (table, includeFields, options) => {
        validateFields(table, includeFields, "select");
        const columns = Object.entries(table).reduce((acc, [key, value]) => {
            if (includeFields.includes(key) &&
                key !== "_") {
                acc[key] = value;
            }
            return acc;
        }, {});
        let query = database.select(columns).from(table);
        if (options?.where) {
            const whereConditions = Array.isArray(options.where)
                ? options.where
                : [options.where];
            const validConditions = whereConditions.filter(Boolean);
            if (validConditions.length > 0) {
                query = query.where(and(...validConditions));
            }
        }
        if (options?.orderBy) {
            const orderByExpressions = Array.isArray(options.orderBy)
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
    const selectExcept = async (table, excludeFields, options) => {
        validateFields(table, excludeFields, "exclude");
        const columns = Object.entries(table).reduce((acc, [key, value]) => {
            if (!excludeFields.includes(key) &&
                key !== "_") {
                acc[key] = value;
            }
            return acc;
        }, {});
        let query = database.select(columns).from(table);
        if (options?.where) {
            const whereConditions = Array.isArray(options.where)
                ? options.where
                : [options.where];
            const validConditions = whereConditions.filter(Boolean);
            if (validConditions.length > 0) {
                query = query.where(and(...validConditions));
            }
        }
        if (options?.orderBy) {
            const orderByExpressions = Array.isArray(options.orderBy)
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
    const getCount = async (table, options) => {
        let query = database.select({ value: count() }).from(table);
        if (options?.where) {
            const whereConditions = Array.isArray(options.where)
                ? options.where
                : [options.where];
            const validConditions = whereConditions.filter(Boolean);
            if (validConditions.length > 0) {
                query = query.where(and(...validConditions));
            }
        }
        if (options?.orderBy) {
            const orderByExpressions = Array.isArray(options.orderBy)
                ? options.orderBy
                : [options.orderBy];
            query = query.orderBy(...orderByExpressions);
        }
        const result = await query.execute();
        return Number(result[0]?.value ?? 0);
    };
    return { selectOnly, selectExcept, getCount };
};
