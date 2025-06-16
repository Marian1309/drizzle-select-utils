# @pidchashyi/drizzle-select-utils

> 🧩 Type-safe field selection utilities for Drizzle ORM — `selectOnly`, `selectExcept`, and `getCount`.

Enhance your query-building experience with clear, validated utilities that help you focus only on the fields you need — with optional filters, ordering, and pagination. Fully type-safe, flexible, and compatible with `drizzle-orm`.

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
import { createSelectorUtils } from "drizzle-select-utils";
import { db } from "@/db";

export const { selectOnly, selectExcept, getCount } = createSelectorUtils(db);
```

---

## 🧩 Table Example

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

Select only the fields you need from a table.

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

Omit sensitive or unneeded fields easily.

```ts
const users = await selectExcept(usersTable, ["passwordHash", "emailVerified"]);
```

---

## 🔢 Usage: `getCount`

Get a count of rows matching conditions.

```ts
const count = await getCount(usersTable, {
  where: [eq(usersTable.active, true)],
});
```

---

## ⚙️ API Reference

### `createSelectorUtils(database)`

Initializes and returns:

- `selectOnly`
- `selectExcept`
- `getCount`

---

### `selectOnly(table, includeFields, options?)`

Returns records with **only** the specified fields.

#### Parameters:

- `table`: A `PgTable` from Drizzle
- `includeFields`: Array of valid column names
- `options?`:
  - `where`: A single or array of `SQL` conditions
  - `orderBy`: A single or array of `SQL` expressions
  - `pagination`: `{ limit?: number; offset?: number }`

---

### `selectExcept(table, excludeFields, options?)`

Returns all columns **except** the excluded ones.

#### Parameters:

Same as `selectOnly`, but use `excludeFields`.

---

### `getCount(table, options?)`

Returns the number of rows matching optional conditions.

#### Parameters:

- `where`: A single or array of `SQL` conditions
- `orderBy`: Optional order to apply

---

## 🧪 Example with Complex Conditions

```ts
import { and, eq, isNotNull } from "drizzle-orm";

const results = await selectOnly(usersTable, ["id", "email"], {
  where: [eq(usersTable.name, "Bob"), isNotNull(usersTable.emailVerified)],
  orderBy: asc(usersTable.createdAt),
  pagination: { limit: 10 },
});
```

---

## 🛡️ Validations & Safeguards

✅ Type-safe column validation  
✅ Converts `camelCase` → `snake_case` in sorting  
❌ Throws on invalid or duplicate fields  
❌ Skips special Drizzle internal `_` fields

---

## 🧑‍💻 Author

Made with 💡 by [Marian Pidchashyi](https://github.com/Marian1309)

---

## 📄 License

MIT © [Marian Pidchashyi](https://github.com/Marian1309)
