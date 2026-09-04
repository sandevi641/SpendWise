# SpendWise — System Architecture Specification

## 1. High-Level System Architecture

SpendWise is structured as a decoupled, multi-tiered full-stack web application designed for high security, data isolation, and financial computation precision.

```text
+-----------------------------------------------------------------------+
|                              CLIENT TIER                              |
|   React 18 + TypeScript + Vite + Tailwind CSS + Recharts + jsPDF     |
|   (Single Page Application, Context API, Protected Auth Guard)       |
+-----------------------------------------------------------------------+
                                  │
                                  │ HTTPS (REST API + JWT Bearer)
                                  ▼
+-----------------------------------------------------------------------+
|                            BACKEND SERVER                             |
|       Node.js + Express + TypeScript (Layered Clean Architecture)     |
|                                                                       |
|   [ Middleware Pipeline: Helmet, CORS, RateLimiter, JWT, Validator ] |
|                                  │                                    |
|   [ Controllers: HTTP Protocol & Response Formatting ]               |
|                                  │                                    |
|   [ Services: Financial Engine, Rules Categorization, OCR, Forecast ] |
|                                  │                                    |
|   [ Repositories: Isolation Queries & Atomic Transactions ]          |
+-----------------------------------------------------------------------+
                                  │
                                  │ Prisma ORM (Type-safe SQL Client)
                                  ▼
+-----------------------------------------------------------------------+
|                            DATABASE TIER                              |
|           PostgreSQL / SQLite (ACID Relational Storage)               |
|   Users, Accounts, Categories, Transactions, Budgets, SavingsGoals   |
+-----------------------------------------------------------------------+
```

## 2. Layered Clean Backend Structure

```text
Request (HTTP)
   │
   ▼
[Routes] (/api/v1/...)
   │
   ▼
[Middlewares]
   ├── Helmet & CORS
   ├── Global / Auth Rate Limiters
   ├── JWT Bearer Authentication
   └── Express-Validator Payload Validation
   │
   ▼
[Controllers]
   └── Parses HTTP params/query/body, delegates to Service, returns standardized ApiResponse JSON.
   │
   ▼
[Services]
   ├── AuthService (Bcrypt salt rounds 12, JWT signing)
   ├── TransactionService (Atomic account balance adjustments)
   ├── DecimalMath (Decimal.js monetary precision)
   ├── CategorizationService (Regex + Keyword rule-based engine)
   ├── ForecastingService (Moving average trend estimation)
   ├── AnalyticsService (Personalized behavioral insights)
   ├── OcrService (Tesseract OCR receipt text processing)
   └── StatementService (PDFKit vector PDF generation)
   │
   ▼
[Repositories]
   └── Type-safe database queries strictly filtered by `userId` (tenant isolation).
   │
   ▼
[Database]
   └── Relational persistence with foreign keys and cascade rules.
```
