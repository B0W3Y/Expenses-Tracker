# Data Model — Personal Expense Tracker

## Relationship diagram

```mermaid
erDiagram
    USER ||--o{ CATEGORY : "creates"
    USER ||--o{ EXPENSE : "logs"
    CATEGORY ||--o{ EXPENSE : "classifies"

    USER {
        uuid id PK
        string email UK
        string password_hash
        string name
        datetime created_at
        datetime updated_at
    }

    CATEGORY {
        uuid id PK
        string name
        string color
        string icon
        uuid user_id FK
        datetime created_at
    }

    EXPENSE {
        uuid id PK
        decimal amount
        string description
        date expense_date
        uuid category_id FK
        uuid user_id FK
        datetime created_at
        datetime updated_at
    }
```

## Tables

### User
Represents each registered person in the app.

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| email | string | Unique, used for login |
| password_hash | string | Never store the password in plain text — use bcrypt |
| name | string | Display name for the UI |
| created_at | datetime | Auto |
| updated_at | datetime | Auto |

### Category
Expense categories, owned by each user (so everyone can customize their own).

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | string | E.g. "Food", "Transportation", "Entertainment" |
| color | string | Hex code, used for charts (e.g. "#FF5733") |
| icon | string | Optional, name of an icon (e.g. from lucide-react) |
| user_id | UUID | Foreign key → User |
| created_at | datetime | Auto |

**Note:** when a new user signs up, it's a good idea to seed some default categories (Food, Transportation, Housing, Entertainment, Health, Other) so they don't start with an empty app.

### Expense
Each individual logged expense.

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| amount | decimal | Use decimal, never float, to avoid rounding errors with money |
| description | string | E.g. "Lunch with friends" |
| expense_date | date | Date of the expense (can differ from created_at) |
| category_id | UUID | Foreign key → Category |
| user_id | UUID | Foreign key → User (redundant with category.user_id but makes queries easier) |
| created_at | datetime | When it was logged in the system |
| updated_at | datetime | Auto |

## Important business rules

1. A user **can only view/edit their own expenses and categories** — this is validated on every endpoint by comparing the `user_id` from the token against the `user_id` of the resource.
2. If a category with associated expenses is deleted, decide on a strategy: block the deletion, reassign the expenses to "Other", or cascade delete (not recommended — you'd lose the history).
3. `amount` should always be positive; if you later want to support income as well as expenses, add a `type` field (`expense` | `income`) instead of using negative amounts.

## Prisma schema (ready to use)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String     @id @default(uuid())
  email         String     @unique
  passwordHash  String
  name          String
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  categories    Category[]
  expenses      Expense[]
}

model Category {
  id        String    @id @default(uuid())
  name      String
  color     String?
  icon      String?
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  expenses  Expense[]
  createdAt DateTime  @default(now())
}

model Expense {
  id           String   @id @default(uuid())
  amount       Decimal  @db.Decimal(10, 2)
  description  String
  expenseDate  DateTime
  categoryId   String
  category     Category @relation(fields: [categoryId], references: [id])
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

## Next steps

1. Copy the Prisma block into `backend/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name init` to create the tables in Postgres
3. From there, start with the `POST /register` endpoint
