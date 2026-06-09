import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import logo from "@/assets/logo.jpg";
import heroImage from "@/assets/hero-savanna.jpg";

const authSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  fullName: z.string().min(2, "Le nom doit contenir au moins 2 caractères").optional(),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const params = new URLSearchParams(location.search);
        const redirect = params.get("redirect");
        navigate(redirect || "/", { replace: true });
      }
    });
  }, [navigate, location.search]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = authSchema.parse({
        email,
        password,
        fullName: isLogin ? undefined : fullName,
      });

      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: validation.email,
          password: validation.password,
        });

        if (error) throw error;

        const userName = data.user?.user_metadata?.full_name || "vous";
        toast({
          title: `Bienvenue, ${userName} ! 🌿`,
          description: "Connexion réussie. Bonne exploration !",
        });

        const params = new URLSearchParams(location.search);
        const redirect = params.get("redirect");
        navigate(redirect || "/", { replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email: validation.email,
          password: validation.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: validation.fullName,
            },
          },
        });

        if (error) throw error;

        toast({
          title: `Bienvenue dans la communauté, ${validation.fullName} ! 🌍`,
          description: "Votre compte a été créé avec succès.",
        });

        const params = new URLSearchParams(location.search);
        const redirect = params.get("redirect");
        navigate(redirect || "/", { replace: true });
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erreur de validation",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        let message = error.message || "Une erreur est survenue";
        if (error.message?.includes("Invalid login credentials")) {
          message = "Email ou mot de passe incorrect";
        } else if (error.message?.includes("User already registered")) {
          message = "Cet email est déjà utilisé";
        }
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setFullName("");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={heroImage}
          alt="Savane africaine"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />
        
        {/* Quote overlay */}
        <div className="relative z-10 flex flex-col justify-end p-12 pb-20">
          <blockquote className="space-y-4">
            <p className="text-2xl md:text-3xl font-serif text-white/95 leading-relaxed italic">
              "La nature ne se presse jamais, et pourtant tout s'accomplit."
            </p>
            <footer className="text-white/70 text-sm tracking-wide">
              — Lao Tseu
            </footer>
          </blockquote>
          
          <div className="mt-12 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/20" />
            <span className="text-white/50 text-xs uppercase tracking-widest">
              Voix du Vivant Afrique
            </span>
            <div className="h-px flex-1 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl" />
              <img
                src={logo}
                alt="Logo Voix du Vivant"
                className="relative w-20 h-20 rounded-full object-cover ring-2 ring-primary/30"
              />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
              {isLogin ? "Bon retour parmi nous" : "Rejoignez l'aventure"}
            </h1>
            <p className="mt-2 text-muted-foreground text-sm">
              {isLogin
                ? "Connectez-vous pour explorer la biodiversité africaine"
                : "Créez votre compte et participez à la conversation"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-5">
            {/* Full Name (signup only) */}
            <div
              className={`space-y-2 transition-all duration-300 ${
                isLogin ? "h-0 opacity-0 overflow-hidden" : "h-auto opacity-100"
              }`}
            >
              <Label htmlFor="fullName" className="text-sm font-medium">
                Nom complet
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jean Dupont"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 h-11 bg-muted/50 border-border focus:bg-background transition-colors"
                  required={!isLogin}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Adresse email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-muted/50 border-border focus:bg-background transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 bg-muted/50 border-border focus:bg-background transition-colors"
                  required
                />
              </div>
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
                  Minimum 6 caractères
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 font-medium group"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? "Se connecter" : "Créer mon compte"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle Mode */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground">
                ou
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleMode}
            className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
          >
            {isLogin ? (
              <>
                Pas encore de compte ?{" "}
                <span className="text-primary font-medium hover:underline">
                  S'inscrire
                </span>
              </>
            ) : (
              <>
                Déjà un compte ?{" "}
                <span className="text-primary font-medium hover:underline">
                  Se connecter
                </span>
              </>
            )}
          </button>

          {/* Mobile Image Background (visible on small screens) */}
          <div className="lg:hidden mt-8 text-center">
            <p className="text-xs text-muted-foreground italic">
              "La nature ne se presse jamais, et pourtant tout s'accomplit."
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">— Lao Tseu</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
