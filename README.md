# Retain – Expense & Budget Manager

## 📌 About the Project

Retain is a full-stack web application that helps users manage their personal expenses, set monthly budgets, and monitor their spending. It allows users to track expenses, view their monthly budgets, and understand how much money they have spent and how much remains.

The project aims to encourage better financial planning and responsible spending through a simple and user-friendly interface.

## 🎯 Objectives

- Help users record and manage their expenses.
- Allow users to create monthly budgets.
- Track spending against monthly budgets.
- Calculate remaining budget balances.
- Provide secure user authentication.
- Help users make informed financial decisions.

## ✨ Features

### 1. User Authentication
- User registration and login.
- JWT-based authentication.
- Protected routes for authenticated users.

### 2. Expense Management
- View and manage expenses.
- Retrieve expenses belonging to the authenticated user.
- Calculate monthly spending.

### 3. Monthly Budget Management
- Create monthly budgets.
- View saved budgets.
- Prevent duplicate budgets for the same user, month, and year.
- Display total spending and remaining budget.
- Show a progress bar indicating budget usage.
- Warn users when they exceed their budget.

## 🛠️ Technologies Used

### Frontend
- React
- TypeScript
- Vite
- React Router
- Bootstrap 5
- Axios

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)

### Development Tools
- Visual Studio Code
- Git and GitHub
- npm
- PowerShell

## 📂 Project Structure

```text
retain/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts
│   │   ├── models/
│   │   │   └── Budget.ts
│   │   ├── routes/
│   │   │   └── budgetRoutes.ts
│   │   └── server.ts
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/
│   │   │   └── useAuth.ts
│   │   ├── pages/
│   │   │   ├── Register.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Expenses.tsx
│   │   │   └── Budgets.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   └── App.tsx
│   └── package.json
│
└── README.md
```

*Note: This structure highlights the main files and may not include every file in your project.*

## ⚙️ Installation and Setup

### Prerequisites

Install the following:
- Node.js and npm
- MongoDB or a MongoDB Atlas database
- Git

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd retain
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual GitHub repository URL.

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
```

Replace the placeholder values with your actual configuration. Never commit your `.env` file or expose your secrets.

Start the backend:

```bash
npm run dev
```

The backend runs at:

`http://localhost:5000`

### 3. Set Up the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

`http://localhost:5173`

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/budgets` | Retrieve the authenticated user's budgets |
| POST | `/api/budgets` | Create a monthly budget |
| GET | `/api/expenses` | Retrieve expenses |

Authentication endpoints are also available for user registration and login. Consult the backend routes for their exact paths.

Budget endpoints require a valid JWT token.

## 💰 Budget Calculation

Retain calculates the total expenses for each budget's month and year.

- **Total Spent:** Sum of expenses recorded for that month.
- **Remaining Balance:** Monthly budget minus total spent.
- **Budget Usage:** Total spent divided by the monthly budget, multiplied by 100.

For example, if a user has a monthly budget of 15,000 and spends 6,000:

- Monthly budget: 15,000
- Total spent: 6,000
- Remaining balance: 9,000
- Budget usage: 40%

## 🔐 Security

- JWT authentication protects private API routes.
- Passwords should be securely hashed before storage.
- Each user should only access their own expenses and budgets.
- Environment variables store sensitive configuration.
- Input validation helps prevent invalid budget data.

## 🚀 Future Improvements

- Edit and delete existing budgets.
- Expense categories and category-based reports.
- Interactive charts and spending analytics.
- Budget notifications and spending alerts.
- Improved dashboard and financial summaries.
- Automated backend and frontend tests.



