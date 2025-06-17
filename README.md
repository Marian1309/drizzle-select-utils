# `@pidchashyi/drizzle-select-utils`

> 🧩 Type-safe field selection utilities for [Drizzle ORM](https://orm.drizzle.team) — `selectOnly`, `selectExcept`, and `getCount`.

Enhance your query-building experience with clear, validated utilities that help you focus only on the fields you need — with optional filters, ordering, grouping, and pagination. Fully type-safe, flexible, and Drizzle-compatible.

---

## 📦 Installation

```bash
npm install drizzle-select-utils
```

---

## 🔧 Setup

```ts
// @/config/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const queryClient = postgres(process.env.DATABASE_URL!);
export const db = drizzle(queryClient);
```

```ts
// @/utils/selector-utils.ts
import createSelectorUtils from "@pidchashyi/drizzle-select-utils";
import { db } from "@/config/db";

export const { selectOnly, selectExcept, getCount } = createSelectorUtils(db);
```

---

## 🧩 Example Table

```ts
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  name: text("name"),
  email: text("email").notNull().unique(),
  image: text("image"),
  passwordHash: text("password_hash"),
  emailVerified: timestamp("emailVerified", {
    withTimezone: true,
    mode: "date",
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
});
```

---

## ✅ Usage: `selectOnly`

Select **only** the fields you need from a table.

```ts
import { eq } from "drizzle-orm";

const users = await selectOnly(usersTable, ["id", "email"], {
  where: eq(usersTable.name, "Alice"),
  orderBy: usersTable.createdAt,
  pagination: { limit: 5, offset: 0 },
});
```

---

## 🚫 Usage: `selectExcept`

Omit unwanted or sensitive fields easily.

```ts
const users = await selectExcept(usersTable, ["passwordHash", "emailVerified"]);
```

---

## 🔢 Usage: `getCount`

Count rows matching the given conditions.

```ts
import { eq } from "drizzle-orm";

const count = await getCount(usersTable, {
  where: eq(usersTable.emailVerified, null),
});
```

---

## ⚙️ API Reference

### `createSelectorUtils(database)`

Initializes the utility functions.

#### Returns:

- `selectOnly(...)`
- `selectExcept(...)`
- `getCount(...)`

---

### `selectOnly(table, includeFields, options?)`

Returns records containing **only** the specified fields.

#### Parameters:

| Name                 | Type                                    | Description                          |
| -------------------- | --------------------------------------- | ------------------------------------ |
| `table`              | `PgTable`                               | Drizzle table object                 |
| `includeFields`      | `Array<keyof InferSelectModel<TTable>>` | Fields to include                    |
| `options.where`      | `SQL<unknown>` \| `SQL<unknown>[]`      | Optional filter conditions           |
| `options.orderBy`    | `SQL<unknown>` \| `SQL<unknown>[]`      | Optional order expressions           |
| `options.groupBy`    | `SQL<unknown>` \| `SQL<unknown>[]`      | Optional group expressions           |
| `options.pagination` | `{ limit?: number; offset?: number }`   | Optional pagination (default: 25, 0) |

---

### `selectExcept(table, excludeFields, options?)`

Returns records with **all columns except** the excluded ones.

#### Parameters:

Same as `selectOnly`, but provide `excludeFields` instead of `includeFields`.

---

### `getCount(table, options?)`

Returns the total number of rows matching the given conditions.

#### Parameters:

| Name              | Type                               | Description                 |
| ----------------- | ---------------------------------- | --------------------------- |
| `table`           | `PgTable`                          | Drizzle table               |
| `options.where`   | `SQL<unknown>` \| `SQL<unknown>[]` | Optional filters            |
| `options.orderBy` | `SQL<unknown>` \| `SQL<unknown>[]` | Optional sorting (optional) |

---

## 🧪 Advanced Example

```ts
import { and, eq, isNotNull, asc } from "drizzle-orm";

const results = await selectOnly(usersTable, ["id", "email"], {
  where: [eq(usersTable.name, "Bob"), isNotNull(usersTable.emailVerified)],
  orderBy: asc(usersTable.createdAt),
  pagination: { limit: 10, offset: 0 },
});
```

---

## 🛡️ Validations & Safeguards

✅ Type-safe column validation
✅ Prevents invalid or duplicate fields
✅ Ignores Drizzle-internal `_` metadata fields
✅ Supports complex SQL conditions
❌ Throws on invalid field names
❌ Throws on duplicates

---

## 👤 Author

Made with 💡 by [Marian Pidchashyi](https://github.com/Marian1309)

---

## 📄 License

MIT © [Marian Pidchashyi](https://github.com/Marian1309/drizzle-select-utils/LICENCE)
