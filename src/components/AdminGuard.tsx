import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * Protège les routes /admin/*. Redirige vers /auth si l'utilisateur n'est
 * pas connecté, vers l'accueil s'il est connecté sans le rôle administrateur.
 */
export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/auth?redirect=${redirect}`, { replace: true });
    } else if (!isAdmin) {
      navigate("/", { replace: true });
    }
  }, [user, loading, isAdmin, navigate, location]);

  if (loading || !user || !isAdmin) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background"
        role="status"
        aria-label="Vérification de l'accès"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;