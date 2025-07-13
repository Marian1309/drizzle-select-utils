import type { InferSelectModel } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

const validateFields = <T extends PgTable>(
  table: T,
  fields: (keyof InferSelectModel<T>)[],
  operation: "select" | "exclude" = "select"
): void => {
  const duplicates = fields.filter(
    (field, index) => fields.indexOf(field) !== index
  );

  if (duplicates.length > 0) {
    throw new Error(
      `Duplicate fields found in ${operation} operation: ${duplicates.join(
        ", "
      )}`
    );
  }

  const invalidFields = fields.filter(
    (field) => !(field in table) || field === "_"
  );

  if (invalidFields.length > 0) {
    throw new Error(
      `Invalid fields for table: ${invalidFields.join(", ")}. ` +
        `Available fields: ${Object.keys(table)
          .filter((k) => k !== "_")
          .join(", ")}`
    );
  }
};

export default validateFields;
