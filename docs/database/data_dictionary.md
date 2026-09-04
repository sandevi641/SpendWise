# SpendWise — Database Data Dictionary

## Tables & Fields Specification

### 1. `users` Table
Stores registered application user accounts.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(36) / UUID | PRIMARY KEY | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Normalized user login email |
| `passwordHash` | VARCHAR(255) | NOT NULL | Bcrypt salt hash (rounds: 12) |
| `firstName` | VARCHAR(100) | NOT NULL | User first name |
| `lastName` | VARCHAR(100) | NOT NULL | User last name |
| `currency` | VARCHAR(5) | DEFAULT 'USD' | Preferred base display currency |
| `monthlyIncomeGoal`| FLOAT / DECIMAL | DEFAULT 0 | User's benchmark monthly income goal |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Registration timestamp |
| `updatedAt` | TIMESTAMP | AUTO-UPDATE | Profile update timestamp |

### 2. `accounts` Table
Tracks user financial accounts (Checking, Savings, Credit Card, Cash).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(36) / UUID | PRIMARY KEY | Unique account identifier |
| `userId` | VARCHAR(36) | FOREIGN KEY (users.id) CASCADE | Owning user |
| `name` | VARCHAR(100) | NOT NULL | Display name of account |
| `type` | VARCHAR(30) | NOT NULL | CHECKING, SAVINGS, CREDIT_CARD, CASH, INVESTMENT |
| `balance` | FLOAT / DECIMAL | DEFAULT 0 | Current ledger balance |
| `color` | VARCHAR(20) | DEFAULT '#C27B38' | Hex theme color |
| `isDefault` | BOOLEAN | DEFAULT FALSE | Default account flag |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

### 3. `categories` Table
Categorization taxonomy for classifying inflows and outflows.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(36) / UUID | PRIMARY KEY | Unique category identifier |
| `userId` | VARCHAR(36) | FOREIGN KEY (users.id) CASCADE, NULLABLE | Null for system globals, string for custom |
| `name` | VARCHAR(100) | NOT NULL | Category name |
| `type` | VARCHAR(20) | NOT NULL | INCOME or EXPENSE |
| `icon` | VARCHAR(50) | DEFAULT 'Tag' | Lucide icon identifier |
| `color` | VARCHAR(20) | DEFAULT '#8B5E3C' | Accent color hex |
| `budgetLimit` | FLOAT / DECIMAL | DEFAULT 0 | Default baseline limit |

### 4. `transactions` Table
Itemized income and expense records.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(36) / UUID | PRIMARY KEY | Unique transaction identifier |
| `userId` | VARCHAR(36) | FOREIGN KEY (users.id) CASCADE | Owning tenant user |
| `accountId` | VARCHAR(36) | FOREIGN KEY (accounts.id) CASCADE | Charged/Credited account |
| `categoryId` | VARCHAR(36) | FOREIGN KEY (categories.id) RESTRICT | Assigned category taxonomy |
| `amount` | FLOAT / DECIMAL | NOT NULL, > 0 | Monetary value |
| `type` | VARCHAR(20) | NOT NULL | INCOME or EXPENSE |
| `date` | TIMESTAMP | DEFAULT NOW() | Transaction date |
| `description` | VARCHAR(255) | NOT NULL | Merchant or narrative memo |
| `paymentMethod` | VARCHAR(30) | DEFAULT 'CARD' | CASH, CARD, BANK_TRANSFER, ONLINE, OTHER |
| `receiptUrl` | VARCHAR(500) | NULLABLE | Uploaded receipt attachment path |
| `tags` | TEXT | NULLABLE | Searchable tags |
| `isRecurring` | BOOLEAN | DEFAULT FALSE | Recurring billing flag |

### 5. `budgets` Table
Monthly spending limits and alert triggers.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(36) / UUID | PRIMARY KEY | Budget record identifier |
| `userId` | VARCHAR(36) | FOREIGN KEY (users.id) CASCADE | Owning user |
| `categoryId` | VARCHAR(36) | FOREIGN KEY (categories.id) CASCADE, NULLABLE | Null = global monthly cap |
| `month` | INTEGER | NOT NULL (1 - 12) | Target calendar month |
| `year` | INTEGER | NOT NULL (e.g. 2026) | Target calendar year |
| `allocatedAmount`| FLOAT / DECIMAL | NOT NULL, > 0 | Maximum allocated budget limit |
| `alertThreshold` | FLOAT | DEFAULT 80.0 | Warning trigger percentage |

### 6. `savings_goals` Table
Financial milestones and savings accumulation vaults.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(36) / UUID | PRIMARY KEY | Savings milestone identifier |
| `userId` | VARCHAR(36) | FOREIGN KEY (users.id) CASCADE | Owning user |
| `name` | VARCHAR(150) | NOT NULL | Goal title |
| `targetAmount` | FLOAT / DECIMAL | NOT NULL, > 0 | Target monetary milestone |
| `currentAmount`| FLOAT / DECIMAL | DEFAULT 0 | Accumulated funding |
| `targetDate` | TIMESTAMP | NULLABLE | Target completion deadline |
| `category` | VARCHAR(50) | DEFAULT 'General' | Milestone bucket |
| `status` | VARCHAR(30) | DEFAULT 'IN_PROGRESS' | IN_PROGRESS, COMPLETED, CANCELLED |
| `color` | VARCHAR(20) | DEFAULT '#D97706' | Theme indicator color |
