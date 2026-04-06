import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
  requireSuperviseur?: boolean;
}

const ProtectedRoute = ({ children, requireSuperviseur }: Props) => {
  const { isAuthenticated, isSuperviseur } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireSuperviseur && !isSuperviseur) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
