# SpendWise — Personal Finance & Daily Spending Management Web App

![SpendWise Banner](https://img.shields.io/badge/Project-Undergraduate_3rd_Year_IT-8B4E1B?style=for-the-badge)
![Full Stack](https://img.shields.io/badge/Stack-React_18_+_Node.js_Express_+_Prisma_ORM-C27B38?style=for-the-badge)
![Tests](https://img.shields.io/badge/Automated_Tests-21_Passed-16A34A?style=for-the-badge)

A full-stack, personal finance and spending management web application built with a **Layered Clean Architecture**, **Prisma ORM**, **Tailwind CSS**, and **Recharts**.

Designed as an **individual 3rd-year undergraduate IT software engineering portfolio project**.

---

## 1. Project Overview & Problem Statement

Managing personal cash flow across accounts, subscriptions, and daily transactions is challenging. Traditional spreadsheets lack real-time categorization and fail to provide actionable forward-looking insights.

**SpendWise** solves this problem by providing:
- **Zero-loss financial arithmetic** (preventing IEEE-754 floating point rounding bugs with Decimal.js precision).
- **Automated rule-based categorization** that suggests category taxonomies as users type or upload receipts.
- **Predictive spending forecasting** with moving average run-rate projections and model confidence scores.
- **Neural OCR receipt scanning** to convert physical paper receipts into structured transactions.
- **Dynamic budget health tracking** with early-warning threshold alerts (e.g. at 80% consumption).
- **Multi-tenant user data isolation** verified through integration testing.
- **Exportable PDF financial statements**.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS (Dark espresso `#16120E`, Warm copper `#C27B38`, and Warm beige `#FAF8F5`)
- **Data Visualization**: Recharts (Donut charts, Multi-series Area graphs, Categorical Bar charts)
- **Icons**: Lucide React
- **HTTP Client**: Axios with centralized JWT Bearer interceptor
- **Routing**: React Router DOM v6 with Protected Layout & Auth Guards

### Backend
- **Runtime & Framework**: Node.js, Express, TypeScript
- **Database & ORM**: PostgreSQL / SQLite with Prisma ORM
- **Authentication**: JSON Web Tokens (JWT) + Bcrypt password hashing (12 rounds)
- **Financial Precision**: Decimal.js
- **OCR Processing**: Tesseract.js (Optical Character Recognition Engine)
- **PDF Generation**: PDFKit vector document engine
- **Security & Reliability**: Helmet, Express Rate Limiter, Express-Validator, CORS

### Testing & Quality Assurance
- **Framework**: Jest + Supertest + Ts-Jest
- **Coverage**: 21 unit and integration tests covering auth, tenant isolation, balance math, categorization, and predictive forecasting.

---

## 3. System Architecture & Folder Structure

```text
SpendWise/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Header, Sidebar, StatCard, Modal
│   │   │   ├── transactions/   # TransactionModal, ReceiptScannerModal
│   │   │   ├── budgets/        # BudgetModal
│   │   │   └── savings/        # SavingsGoalModal, ContributeModal
│   │   ├── layouts/            # DashboardLayout
│   │   ├── pages/
│   │   │   ├── auth/           # LoginPage, RegisterPage
│   │   │   ├── dashboard/      # DashboardPage
│   │   │   ├── transactions/   # TransactionsPage
│   │   │   ├── budgets/        # BudgetsPage
│   │   │   ├── savings/        # SavingsPage
│   │   │   ├── analytics/      # AnalyticsPage
│   │   │   └── settings/       # SettingsPage
│   │   ├── services/           # api, auth, transactions, budgets, savings, analytics, ocr
│   │   ├── context/            # AuthContext
│   │   ├── types/              # TypeScript interfaces
│   │   ├── utils/              # formatters, decimal math
│   │   └── routes/             # AppRoutes, ProtectedRoute
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── config/             # env, database, constants
│   │   ├── controllers/        # auth, account, category, transaction, budget, savings, analytics, ocr
│   │   ├── middleware/         # authMiddleware, validationMiddleware, errorHandler, rateLimiter
│   │   ├── routes/             # authRoutes, transactionRoutes, budgetRoutes, savingsRoutes, analyticsRoutes...
│   │   ├── services/           # authService, transactionService, categorizationService, forecastingService...
│   │   ├── repositories/       # userRepository, accountRepository, transactionRepository, budgetRepository...
│   │   ├── validators/         # express-validator schemas
│   │   ├── types/              # DTOs and express request types
│   │   ├── utils/              # decimalMath, password, token, seedDefaults
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── tests/
│   │   ├── unit/               # decimalMath, categorization, forecasting
│   │   └── integration/        # auth, transactions, isolation
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   ├── architecture/           # system_architecture.md
│   ├── database/               # schema_erd.md, data_dictionary.md
│   └── api/                    # api_documentation.md, openapi_spec.json
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 4. Setup & Running Instructions

### Prerequisites
- **Node.js**: v18+ (Tested on v24)
- **npm**: v9+

### 1. Backend Setup
```bash
cd backend
npm install

# Initialize database schema & seed with demo dataset
npx prisma db push
npx ts-node prisma/seed.ts

# Run automated tests
npm test

# Start backend server (Runs on port 5000)
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start Vite development server (Runs on port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 5. Pre-Configured Demo Credentials

For quick evaluation:
- **Email**: `demo@spendwise.com`
- **Password**: `DemoPass123!`

*(The database comes pre-populated with accounts, categories, historical transactions, active budgets, and savings goals.)*

---

## 6. Advanced Engineering Highlights

### 1. Modular Rule-Based Automatic Categorization
Matches keywords, phrases, and regex patterns (e.g. `Uber to university` -> **Transportation**, `Whole Foods Market` -> **Groceries**, `Netflix` -> **Entertainment**).

### 2. Explainable Spending Forecasting
Computes current month burn rate ($/day) and projects final month-end spend alongside a weighted historical moving average for next month with a confidence metric.

### 3. Neural Receipt Scanning (OCR)
Upload any receipt or test benchmark receipts to extract merchant names, line items, transaction dates, and total prices automatically.

### 4. PDF Statement Export
Generates a downloadable, verified PDF statement complete with user metadata, period summary cards, itemized ledger table, and watermark footer.

---

## 7. Testing & Verification

Run the comprehensive test suite in `backend/`:
```bash
npm test
```

Results:
- **Unit Tests**: Decimal floating-point accuracy, keyword categorization, forecasting model.
- **Integration Tests**: JWT registration/login, atomic account balance adjustments, and multi-tenant user data isolation.

---

## 8. License & Academic Integrity
Developed as an **Individual Undergraduate 3rd-Year IT Project**. All rights reserved.
