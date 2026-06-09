import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Upload, Loader2, Camera } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Profile = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    if (data) {
      setFullName(data.full_name || "");
      setAvatarUrl(data.avatar_url || "");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "L'image ne doit pas dépasser 5 Mo",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-avatars")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("profile-avatars")
        .getPublicUrl(fileName);

      setAvatarUrl(data.publicUrl);
      toast({
        title: "Photo uploadée",
        description: "Votre photo de profil a été mise à jour",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Échec de l'upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        avatar_url: avatarUrl,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profil mis à jour",
        description: "Vos modifications ont été enregistrées",
      });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <Card className="p-8">
          <h1 className="text-3xl font-serif font-bold mb-6">Mon Profil</h1>

          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 ring-4 ring-primary/10">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 flex items-center justify-center bg-foreground/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploading ? (
                    <Loader2 className="h-6 w-6 text-background animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-background" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </div>
              <div>
                <p className="font-medium text-lg">{fullName || "Sans nom"}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <p className="text-sm text-primary font-medium mt-1">
                  Rôle: {userRole || "utilisateur"}
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-sm text-primary hover:underline mt-2 flex items-center gap-1"
                >
                  <Upload className="h-3 w-3" />
                  {uploading ? "Upload en cours..." : "Changer la photo"}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
