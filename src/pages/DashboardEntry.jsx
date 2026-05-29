import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Dashboard from "./Dashboard.jsx";

function DashboardEntry() {
  const { user } = useAuth();

  if (user?.role === "USER") {
    return <Navigate to="/my-bookings" replace />;
  }

  return <Dashboard />;
}

export default DashboardEntry;
