import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

/**
 * Hook d'authentification simplifié : un seul rôle reconnu est « admin ».
 * Tout autre utilisateur est traité comme visiteur connecté standard.
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching user role:", error);
        setUserRole(null);
        return;
      }
      
      setUserRole(data?.role || null);
    } catch (error) {
      console.error("Error fetching user role:", error);
      setUserRole(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener first
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Use setTimeout to avoid potential race conditions
        setTimeout(() => {
          if (mounted) {
            fetchUserRole(session.user.id);
          }
        }, 0);
      } else {
        setUserRole(null);
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserRole]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUserRole(null);
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [navigate]);

  const isAdmin = useMemo(() => userRole === "admin", [userRole]);

  return useMemo(() => ({
    user,
    session,
    loading,
    userRole,
    isAdmin,
    signOut,
  }), [user, session, loading, userRole, isAdmin, signOut]);
};
