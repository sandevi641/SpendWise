# SpendWise — RESTful API Documentation

**Base URL**: `http://localhost:5000/api/v1`

All protected endpoints require the HTTP header:
`Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication Endpoints

### `POST /auth/register`
Creates a new user account, generates default accounts and categories, and returns a JWT token.
- **Request Body**:
```json
{
  "email": "alex@university.edu",
  "password": "Password123!",
  "firstName": "Alex",
  "lastName": "Morgan",
  "currency": "USD"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-v4",
      "email": "alex@university.edu",
      "firstName": "Alex",
      "lastName": "Morgan",
      "currency": "USD"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### `POST /auth/login`
- **Request Body**:
```json
{
  "email": "demo@spendwise.com",
  "password": "DemoPass123!"
}
```

### `GET /auth/me` *(Protected)*
Returns currently authenticated user profile.

---

## 2. Transactions Endpoints

### `GET /transactions` *(Protected)*
Query Parameters:
- `search`: string filter for description/vendor
- `type`: `INCOME` | `EXPENSE`
- `categoryId`: string uuid
- `accountId`: string uuid
- `startDate`: ISO8601 date
- `endDate`: ISO8601 date
- `page`: integer (default: 1)
- `limit`: integer (default: 20)

### `POST /transactions` *(Protected)*
Creates a transaction and atomically modifies the associated account balance.
- **Request Body**:
```json
{
  "accountId": "acc-uuid",
  "categoryId": "cat-uuid",
  "amount": 42.50,
  "type": "EXPENSE",
  "description": "Starbucks Coffee & Snacks",
  "date": "2026-09-04",
  "paymentMethod": "CARD"
}
```

### `GET /transactions/suggest-category` *(Protected)*
- **Query**: `description=Uber to university&type=EXPENSE`
- **Response**: `{ "categoryName": "Transportation", "confidence": 0.95 }`

---

## 3. Budgets Endpoints

### `GET /budgets` *(Protected)*
- **Query**: `month=9&year=2026`
- Returns configured category and overall monthly limits with calculated spending and warning threshold triggers.

### `POST /budgets` *(Protected)*
Sets or updates a monthly category budget.
```json
{
  "categoryId": "cat-uuid",
  "month": 9,
  "year": 2026,
  "allocatedAmount": 500,
  "alertThreshold": 80
}
```

---

## 4. Savings Goals Endpoints

### `GET /savings` *(Protected)*
Lists all savings milestones, current funding percentages, and target deadlines.

### `POST /savings/:id/contribute` *(Protected)*
Deposits additional savings towards a milestone.

---

## 5. Analytics & AI Insights Endpoints

### `GET /analytics/dashboard` *(Protected)*
Returns high-level summary metrics (net worth, monthly inflow/outflow, category donut breakdown, recent activity).

### `GET /analytics` *(Protected)*
- **Query**: `year=2026&month=9`
- Returns daily cash trajectory series, 12-month annual comparison, predictive forecasting model metrics, and personalized insights feed.

---

## 6. OCR & Statement Exports

### `POST /ocr/scan` *(Protected)*
Multipart form data with `receiptImage` file or JSON `sampleText`.
Returns extracted merchant, line items, total amount, and suggested category.

### `GET /statements/export-pdf` *(Protected)*
Generates and downloads a verified, branded PDF ledger statement.
