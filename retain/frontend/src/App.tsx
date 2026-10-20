
import { Link, Routes, Route } from "react-router-dom";
import { useAuth } from "./context/useAuth.ts";
import Register from "./pages/Register.tsx";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Expenses from "./pages/Expenses";
import Budgets from "./pages/Budgets";

function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="container py-5">
      <h1 className="display-5 fw-bold">Welcome to Retain</h1>
      <p className="lead">
        Manage your expenses and stay within your monthly budget.
      </p>

      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>

          <div className="d-flex gap-2 flex-wrap">
            <Link to="/expenses" className="btn btn-success">
              View Expenses
            </Link>

            <Link to="/budgets" className="btn btn-primary">
              Manage Budgets
            </Link>

            <button
              className="btn btn-outline-danger"
              onClick={logout}
            >
              Sign out
            </button>
          </div>
        </div>
      ) : (
        <div className="d-flex gap-2">
          <Link to="/login" className="btn btn-primary">
            Sign in
          </Link>

          <Link to="/register" className="btn btn-outline-primary">
            Create account
          </Link>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/budgets" element={<Budgets />} />
      </Route>
    </Routes>
  );
}
