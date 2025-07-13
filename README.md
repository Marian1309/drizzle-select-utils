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

export const { selectOnly, selectExcept, getCount, doesExist } =
  createSelectorUtils(db);
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

const users = await selectOnly(usersTable, {
  fields: ["id", "email"],
  where: eq(usersTable.name, "Alice"),
  orderBy: usersTable.createdAt,
  pagination: { limit: 5, offset: 0 },
});
```

### 2️⃣ `selectExcept`

Omit unwanted or sensitive fields easily.

```ts
const users = await selectExcept(usersTable, {
  fields: ["passwordHash", "emailVerified"],
  pagination: { limit: 10, offset: 0 },
});
```

### 3️⃣ `getCount`

Count rows matching the given conditions.

```ts
import { eq } from "drizzle-orm";

const count = await getCount(usersTable, {
  where: eq(usersTable.emailVerified, null),
});
```

### 4️⃣ `doesExist`

Check if records matching certain conditions exist.

```ts
import { eq } from "drizzle-orm";

const hasAdmin = await doesExist(usersTable, {
  where: eq(usersTable.role, "admin"),
});
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

// For selectOnly
type SelectOptions<
  T extends PgTable,
  K extends Readonly<(keyof InferSelectModel<T>)[]>
> = QueryOptions<T> & {
  fields: K;
};

// For selectExcept
type ExcludeOptions<
  T extends PgTable,
  K extends Readonly<(keyof InferSelectModel<T>)[]>
> = QueryOptions<T> & {
  fields: K;
};
```

### Method Signatures

#### `selectOnly<TTable, TFields>(table, options)`

- Returns: `Promise<Array<Pick<InferSelectModel<TTable>, TFields[number]>>>`
- Default pagination: `{ limit: 25, offset: 0 }`

#### `selectExcept<TTable, TFields>(table, options)`

- Returns: `Promise<Array<Omit<InferSelectModel<TTable>, TFields[number]>>>`
- Default pagination: `{ limit: 10, offset: 0 }`

#### `getCount<TTable>(table, options?)`

- Returns: `Promise<number>`
- Excludes pagination options

#### `doesExist<TTable>(table, options)`

- Returns: `Promise<boolean>`
- Requires where conditions

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
import { eq, isNotNull, desc } from "drizzle-orm";

// Fetch active users with pagination and sorting
const activeUsers = await selectOnly(usersTable, {
  fields: ["id", "name", "email", "createdAt"],
  where: [eq(usersTable.isActive, true), isNotNull(usersTable.emailVerified)],
  orderBy: desc(usersTable.createdAt),
  pagination: { limit: 20, offset: 40 },
});

// Check if premium users exist
const hasPremiumUsers = await doesExist(usersTable, {
  where: eq(usersTable.plan, "premium"),
});

// Get count of verified users
const verifiedCount = await getCount(usersTable, {
  where: isNotNull(usersTable.emailVerified),
});
```

---

## 📄 License

MIT © [Marian Pidchashyi](https://github.com/Marian1309/drizzle-select-utils)
