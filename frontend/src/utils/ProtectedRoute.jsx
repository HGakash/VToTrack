import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const role = localStorage.getItem("role");

  if (!role || !allowedRoles.includes(role)) {
    // Clear any sensitive data
    localStorage.removeItem("role");
    return <Navigate to="/" replace state={{ from: "protected" }} />;
  }

  return children;
};

export default ProtectedRoute;



