# `drizzle-select-utils`

> 🧩 Type-safe field selection utilities for [Drizzle ORM](https://orm.drizzle.team) — A comprehensive collection of utilities for efficient database operations.

Enhance your query-building experience with clear, validated utilities that help you focus on exactly what you need — with optional filters, ordering, grouping, and pagination. Fully type-safe, flexible, and Drizzle-compatible.

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
import createSelectorUtils from "drizzle-select-utils";
import { db } from "@/config/db";

export const {
  selectOnly,
  selectExcept,
  selectAll,
  selectOne,
  getCount,
  exists,
  pluck,
  selectRaw,
} = createSelectorUtils(db);
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

## 🛠️ Core Utilities

### 1️⃣ `selectOnly`

Select **only** the fields you need from a table.

```ts
import { eq } from "drizzle-orm";

const users = await selectOnly(usersTable, ["id", "email"], {
  where: eq(usersTable.name, "Alice"),
  orderBy: usersTable.createdAt,
  pagination: { limit: 5, offset: 0 },
});
```

### 2️⃣ `selectExcept`

Omit unwanted or sensitive fields easily.

```ts
const users = await selectExcept(
  usersTable,
  ["passwordHash", "emailVerified"],
  {
    pagination: { limit: 10, offset: 0 },
  }
);
```

### 3️⃣ `selectAll`

Retrieve all fields from a table with optional filtering and pagination.

```ts
const allUsers = await selectAll(usersTable, {
  where: eq(usersTable.emailVerified, true),
  orderBy: usersTable.createdAt,
  pagination: { limit: 25, offset: 0 },
});
```

### 4️⃣ `selectOne`

Fetch a single record matching the conditions.

```ts
const user = await selectOne(usersTable, {
  where: eq(usersTable.email, "user@example.com"),
});
```

### 5️⃣ `getCount`

Count rows matching the given conditions.

```ts
import { eq } from "drizzle-orm";

const count = await getCount(usersTable, {
  where: eq(usersTable.emailVerified, null),
});
```

### 6️⃣ `exists`

Check if records matching certain conditions exist.

```ts
const hasAdmin = await exists(usersTable, [
  eq(usersTable.role, "admin"),
  eq(usersTable.isActive, true),
]);
```

### 7️⃣ `pluck`

Extract a single field from matching records.

```ts
const emails = await pluck(usersTable, "email", {
  where: eq(usersTable.isActive, true),
  orderBy: usersTable.createdAt,
});
```

### 8️⃣ `selectRaw`

Execute raw SQL queries when needed.

```ts
import { sql } from "drizzle-orm";

const results = await selectRaw(sql`SELECT COUNT(*) FROM users GROUP BY role`);
```

---

## ⚙️ API Reference

### Common Options Interface

All methods accept a common options object with the following structure:

```ts
type QueryOptions<T extends PgTable> = {
  where?: SQL<unknown> | SQL<unknown>[];
  pagination?: {
    limit?: number;
    offset?: number;
  };
  orderBy?: SQL<unknown> | SQL<unknown>[];
  groupBy?: SQL<unknown> | SQL<unknown>[];
};
```

### Method Signatures

#### `selectOnly<TTable, TFields>(table, includeFields, options?)`

- Returns: `Promise<Array<Pick<InferSelectModel<TTable>, TFields[number]>>>`
- Default pagination: `{ limit: 25, offset: 0 }`

#### `selectExcept<TTable, TFields>(table, excludeFields, options?)`

- Returns: `Promise<Array<Omit<InferSelectModel<TTable>, TFields[number]>>>`
- Default pagination: `{ limit: 10, offset: 0 }`

#### `selectAll<TTable>(table, options?)`

- Returns: `Promise<Array<InferSelectModel<TTable>>>`
- Default pagination: `{ limit: 25, offset: 0 }`

#### `selectOne<TTable>(table, options)`

- Returns: `Promise<InferSelectModel<TTable> | undefined>`
- Always uses `limit: 1`

#### `getCount<TTable>(table, options?)`

- Returns: `Promise<number>`
- Excludes pagination options

#### `exists<TTable>(table, where)`

- Returns: `Promise<boolean>`
- Requires where conditions

#### `pluck<TTable, K>(table, field, options?)`

- Returns: `Promise<Array<InferSelectModel<TTable>[K]>>`
- Extracts single field values

#### `selectRaw<TResult>(rawSql)`

- Returns: `Promise<TResult[]>`
- Executes raw SQL queries

---

## 🛡️ Validations & Safeguards

✅ Type-safe column validation
✅ Prevents invalid or duplicate fields
✅ Ignores Drizzle-internal `_` metadata fields
✅ Supports complex SQL conditions
✅ Automatic pagination defaults
✅ SQL injection protection via prepared statements
❌ Throws on invalid field names
❌ Throws on duplicates

---

## 🧪 Advanced Example

```ts
import { and, eq, isNotNull, asc } from "drizzle-orm";

// Complex query with multiple conditions
const results = await selectOnly(usersTable, ["id", "email", "role"], {
  where: [
    eq(usersTable.isActive, true),
    isNotNull(usersTable.emailVerified),
    sql`${usersTable.lastLogin} > NOW() - INTERVAL '30 days'`,
  ],
  orderBy: [asc(usersTable.role), desc(usersTable.lastLogin)],
  groupBy: [usersTable.role],
  pagination: { limit: 10, offset: 0 },
});

// Checking existence with multiple conditions
const hasRecentAdmin = await exists(usersTable, [
  eq(usersTable.role, "admin"),
  sql`${usersTable.lastLogin} > NOW() - INTERVAL '24 hours'`,
]);

// Extracting specific fields with filtering
const activeUserEmails = await pluck(usersTable, "email", {
  where: eq(usersTable.isActive, true),
  orderBy: usersTable.createdAt,
});
```

---

## 👤 Author

Made with 💡 by [Marian Pidchashyi](https://github.com/Marian1309)

---

## 📄 License

MIT © [LICENCE](https://github.com/Marian1309/drizzle-select-utils/blob/main/LICENSE)
