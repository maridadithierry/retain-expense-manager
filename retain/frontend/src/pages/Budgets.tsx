
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

interface Budget {
  _id: string;
  month: number;
  year: number;
  amount: number;
}

interface Expense {
  _id: string;
  amount: number;
  date: string;
}

const monthNames = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

const formatMoney = (amount: number) =>
  amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function Budgets() {
  const today = new Date();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [budgetResponse, expenseResponse] = await Promise.all([
        api.get<Budget[]>("/budgets"),
        api.get<Expense[]>("/expenses"),
      ]);

      setBudgets(budgetResponse.data);
      setExpenses(expenseResponse.data);
      setError("");
    } catch {
      setError("Unable to load budgets or expenses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      await api.post("/budgets", {
        month,
        year,
        amount: Number(amount),
      });

      setAmount("");
      setMessage("Monthly budget saved successfully.");
      await loadData();
    } catch (err: unknown) {
      const responseMessage =
        typeof err === "object" &&
        err !== null &&
        "response" in err
          ? (err as { response?: { data?: { message?: string } } })
              .response?.data?.message
          : undefined;

      setError(responseMessage || "Unable to save budget.");
    } finally {
      setSaving(false);
    }
  };

  const getSpent = (budget: Budget) =>
    expenses.reduce((total, expense) => {
      const expenseDate = new Date(expense.date);

      if (
        expenseDate.getMonth() + 1 === budget.month &&
        expenseDate.getFullYear() === budget.year
      ) {
        return total + expense.amount;
      }

      return total;
    }, 0);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h1 className="h2">Monthly Budgets</h1>
          <p className="text-muted">
            Track your spending and stay within your budget.
          </p>
        </div>

        <Link to="/expenses" className="btn btn-outline-success">
          Back to Expenses
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="card shadow-sm mb-4">
        <div className="card-body p-4">
          <h2 className="h5 mb-3">Set a Monthly Budget</h2>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label htmlFor="month" className="form-label">
                  Month
                </label>
                <select
                  id="month"
                  className="form-select"
                  value={month}
                  onChange={(event) => setMonth(Number(event.target.value))}
                >
                  {monthNames.map((name, index) => (
                    <option key={name} value={index + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label htmlFor="year" className="form-label">
                  Year
                </label>
                <input
                  id="year"
                  type="number"
                  className="form-control"
                  min="2000"
                  value={year}
                  onChange={(event) => setYear(Number(event.target.value))}
                  required
                />
              </div>

              <div className="col-md-4">
                <label htmlFor="amount" className="form-label">
                  Budget Amount
                </label>
                <input
                  id="amount"
                  type="number"
                  className="form-control"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="e.g. 15000"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-success mt-3"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Budget"}
            </button>
          </form>
        </div>
      </div>

      <h2 className="h4 mb-3">Your Budgets</h2>

      {loading ? (
        <p>Loading budgets...</p>
      ) : budgets.length === 0 ? (
        <p className="text-muted">No budgets created yet.</p>
      ) : (
        <div className="row g-4">
          {budgets.map((budget) => {
            const spent = getSpent(budget);
            const remaining = budget.amount - spent;
            const percentage =
              budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
            const progress = Math.min(percentage, 100);

            return (
              <div className="col-md-6" key={budget._id}>
                <div className="card shadow-sm h-100">
                  <div className="card-body p-4">
                    <h3 className="h5">
                      {monthNames[budget.month - 1]} {budget.year}
                    </h3>

                    <p className="text-muted mb-1">Monthly budget</p>
                    <p className="fs-4 fw-bold">
                      {formatMoney(budget.amount)}
                    </p>

                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <p className="text-muted mb-1">Total spent</p>
                        <p className="fw-semibold mb-0">
                          {formatMoney(spent)}
                        </p>
                      </div>

                      <div className="col-6">
                        <p className="text-muted mb-1">
                          {remaining < 0 ? "Over budget" : "Remaining"}
                        </p>
                        <p
                          className={`fw-semibold mb-0 ${
                            remaining < 0 ? "text-danger" : "text-success"
                          }`}
                        >
                          {formatMoney(Math.abs(remaining))}
                        </p>
                      </div>
                    </div>

                    <div
                      className="progress"
                      role="progressbar"
                      aria-label="Monthly budget used"
                      aria-valuenow={Math.round(progress)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      style={{ height: "12px" }}
                    >
                      <div
                        className={`progress-bar ${
                          percentage >= 100
                            ? "bg-danger"
                            : percentage >= 80
                              ? "bg-warning"
                              : "bg-success"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="d-flex justify-content-between mt-2">
                      <small className="text-muted">
                        {percentage.toFixed(1)}% used
                      </small>
                      {percentage >= 100 && (
                        <small className="text-danger fw-semibold">
                          Budget exceeded
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
