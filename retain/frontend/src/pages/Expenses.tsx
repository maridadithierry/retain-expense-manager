
import { useEffect, useState, type FormEvent } from "react";
import api from "../services/api";

interface Category {
  _id: string;
  name: string;
}

interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: Category | string;
  date: string;
  paymentMethod: string;
  description?: string;
}

const emptyForm = {
  title: "",
  amount: "",
  category: "",
  date: new Date().toISOString().slice(0, 10),
  paymentMethod: "mpesa",
  description: "",
};

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [expenseResponse, categoryResponse] = await Promise.all([
        api.get<Expense[]>("/expenses"),
        api.get<Category[]>("/categories"),
      ]);

      setExpenses(expenseResponse.data);
      setCategories(categoryResponse.data);
    } catch {
      setError("Could not load your expenses. Please sign in again or try later.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function updateField(
    field: keyof typeof emptyForm,
    value: string
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.category) {
      setError("Please select a category.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
      paymentMethod: form.paymentMethod,
      description: form.description.trim(),
    };

    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}`, payload);
        setMessage("Expense updated successfully.");
      } else {
        await api.post("/expenses", payload);
        setMessage("Expense added successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch {
      setError("Could not save the expense. Check the details and try again.");
    }
  }

  function startEditing(expense: Expense) {
    setEditingId(expense._id);
    setForm({
      title: expense.title,
      amount: String(expense.amount),
      category:
        typeof expense.category === "string"
          ? expense.category
          : expense.category._id,
      date: expense.date.slice(0, 10),
      paymentMethod: expense.paymentMethod,
      description: expense.description ?? "",
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteExpense(id: string) {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      await api.delete(`/expenses/${id}`);
      setMessage("Expense deleted successfully.");
      await loadData();
    } catch {
      setError("Could not delete this expense.");
    }
  }

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <main className="container py-4 py-md-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <p className="text-success fw-semibold mb-1">RETAIN / YOUR FINANCES</p>
          <h1 className="h2 fw-bold mb-1">Expense dashboard</h1>
          <p className="text-muted mb-0">
            Keep track of where your money goes.
          </p>
        </div>
        <button
          className="btn btn-outline-secondary"
          onClick={() => void loadData()}
        >
          Refresh
        </button>
      </div>

      <div className="card border-0 shadow-sm mb-4 retain-total">
        <div className="card-body p-4">
          <p className="mb-2">Total recorded expenses</p>
          <h2 className="display-6 fw-bold mb-1">
            KSh {total.toLocaleString("en-KE", { maximumFractionDigits: 2 })}
          </h2>
          <p className="mb-0 small">
            Across {expenses.length} recorded expense
            {expenses.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <section className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <h2 className="h5 fw-bold mb-3">
            {editingId ? "Edit expense" : "Add a new expense"}
          </h2>

          {categories.length === 0 && !loading && (
            <div className="alert alert-warning">
              No categories were found. Add a category to your database before
              creating an expense.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="expense-title" className="form-label">
                  Expense name
                </label>
                <input
                  id="expense-title"
                  className="form-control"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g. Groceries"
                  required
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="expense-amount" className="form-label">
                  Amount (KSh)
                </label>
                <input
                  id="expense-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="form-control"
                  value={form.amount}
                  onChange={(e) => updateField("amount", e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="expense-category" className="form-label">
                  Category
                </label>
                <select
                  id="expense-category"
                  className="form-select"
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label htmlFor="expense-date" className="form-label">
                  Date
                </label>
                <input
                  id="expense-date"
                  type="date"
                  className="form-control"
                  value={form.date}
                  onChange={(e) => updateField("date", e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="expense-payment" className="form-label">
                  Payment method
                </label>
                <select
                  id="expense-payment"
                  className="form-select"
                  value={form.paymentMethod}
                  onChange={(e) => updateField("paymentMethod", e.target.value)}
                >
                  <option value="mpesa">M-Pesa</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="col-md-6">
                <label htmlFor="expense-description" className="form-label">
                  Description (optional)
                </label>
                <input
                  id="expense-description"
                  className="form-control"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Add a note"
                />
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2 mt-4">
              <button
                className="btn btn-success"
                type="submit"
                disabled={loading || categories.length === 0}
              >
                {editingId ? "Save changes" : "Add expense"}
              </button>

              {editingId && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                    setError("");
                    setMessage("");
                  }}
                >
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      <section className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h2 className="h5 fw-bold mb-3">Expense history</h2>

          {loading ? (
            <p>Loading expenses...</p>
          ) : expenses.length === 0 ? (
            <p className="text-muted mb-0">
              No expenses yet. Add your first expense above.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Expense</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Payment</th>
                    <th className="text-end">Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense._id}>
                      <td>
                        <strong>{expense.title}</strong>
                        {expense.description && (
                          <div className="small text-muted">
                            {expense.description}
                          </div>
                        )}
                      </td>
                      <td>
                        {typeof expense.category === "string"
                          ? "Category"
                          : expense.category.name}
                      </td>
                      <td>{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="text-capitalize">{expense.paymentMethod}</td>
                      <td className="text-end text-nowrap fw-semibold">
                        KSh {expense.amount.toLocaleString("en-KE")}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => startEditing(expense)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => void deleteExpense(expense._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
