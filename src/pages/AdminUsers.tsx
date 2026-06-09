import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, UserCog } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
}

const AdminUsers = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
    ]);

    if (profilesRes.error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    } else {
      setProfiles(profilesRes.data || []);
    }

    if (rolesRes.data) {
      const rolesMap: Record<string, string> = {};
      rolesRes.data.forEach((role: UserRole) => {
        rolesMap[role.user_id] = role.role;
      });
      setUserRoles(rolesMap);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "admin" | "editor" | "user") => {
    // First, check if user has a role
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingRole) {
      // Update existing role
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole } as any)
        .eq("user_id", userId);

      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    } else {
      // Insert new role
      const { error } = await supabase
        .from("user_roles")
        .insert([{ user_id: userId, role: newRole } as any]);

      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: "Succès",
      description: "Rôle mis à jour",
    });
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-4xl font-serif font-bold text-foreground">
          Gestion des utilisateurs
        </h1>
      </div>

      <Card className="p-6">
        <p className="text-muted-foreground mb-4">
          Gérez les rôles des utilisateurs de la plateforme. Les rôles
          disponibles sont :
        </p>
        <ul className="space-y-2 text-muted-foreground mb-6">
          <li>• <strong>Admin</strong> : Accès complet à toutes les fonctionnalités</li>
          <li>• <strong>Editor</strong> : Peut créer et modifier des articles et podcasts</li>
          <li>• <strong>User</strong> : Utilisateur standard sans privilèges d'administration</li>
        </ul>
      </Card>

      <div className="space-y-4">
        {profiles.map((profile) => (
          <Card key={profile.id} className="p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <UserCog className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium text-foreground">
                    {profile.full_name || "Sans nom"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Inscrit le {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={userRoles[profile.user_id] || "user"}
                  onValueChange={(value) => handleRoleChange(profile.user_id, value as "admin" | "editor" | "user")}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="editor">Éditeur</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;
