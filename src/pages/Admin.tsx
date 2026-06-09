import { useEffect } from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, FileText, Headphones, Users, LogOut, Clock, MessageSquare, Home } from "lucide-react";
import logo from "@/assets/logo.jpg";
import { useEffect as useEffectReact, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  const { user, loading, isAdmin, signOut } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate(`/auth?redirect=${encodeURIComponent(location.pathname)}`);
    }
  }, [user, loading, isAdmin, navigate, location.pathname]);

  useEffectReact(() => {
    if (!isAdmin) return;
    const load = async () => {
      const [a, p] = await Promise.all([
        supabase.from("articles").select("*", { count: "exact", head: true }).eq("published", false),
        supabase.from("podcasts").select("*", { count: "exact", head: true }).eq("published", false),
      ]);
      setPendingCount((a.count || 0) + (p.count || 0));
    };
    load();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const menuItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Tableau de bord" },
    { path: "/admin/moderation", icon: Clock, label: "Modération" },
    { path: "/admin/articles", icon: FileText, label: "Articles" },
    { path: "/admin/podcasts", icon: Headphones, label: "Podcasts" },
    { path: "/admin/comments", icon: MessageSquare, label: "Commentaires" },
    { path: "/admin/users", icon: Users, label: "Utilisateurs" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-card border-r border-border p-6">
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="Logo" className="w-16 h-16 rounded-full mb-3 object-cover" />
            <h2 className="font-serif font-bold text-xl text-foreground">Administration</h2>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const showBadge = item.path === "/admin/moderation" && pendingCount > 0;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start relative"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                    {showBadge && (
                      <Badge className="ml-auto" variant="destructive">
                        {pendingCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-8 space-y-2">
            <Link to="/">
              <Button variant="outline" className="w-full justify-start">
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Admin;
