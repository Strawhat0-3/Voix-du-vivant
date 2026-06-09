import { useState } from 'react';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface NewsletterFormProps {
  className?: string;
  variant?: 'default' | 'compact' | 'card';
  title?: string;
  subtitle?: string;
}

export const NewsletterForm = ({ className, variant = 'default', title, subtitle }: NewsletterFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast({
        title: "Email invalide",
        description: "Veuillez entrer une adresse email valide.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Déjà inscrit",
            description: "Cette adresse email est déjà inscrite à la newsletter.",
          });
        } else {
          throw error;
        }
      } else {
        setIsSuccess(true);
        setEmail('');
        toast({
          title: "Inscription réussie !",
          description: "Merci de vous être inscrit à notre newsletter.",
        });
      }
    } catch (error) {
      console.error('Newsletter error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de vous inscrire. Réessayez plus tard.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess && variant !== 'compact') {
    return (
      <div className={cn("flex items-center gap-3 p-4 bg-primary/10 rounded-lg", className)}>
        <CheckCircle className="h-6 w-6 text-primary" />
        <div>
          <p className="font-medium text-foreground">Merci pour votre inscription !</p>
          <p className="text-sm text-muted-foreground">
            Vous recevrez bientôt nos dernières actualités.
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn("bg-card border border-border rounded-xl p-6", className)}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">Newsletter</h3>
            <p className="text-sm text-muted-foreground">
              Recevez nos derniers articles et podcasts
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background"
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inscription...
              </>
            ) : (
              "S'inscrire"
            )}
          </Button>
        </form>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={cn("flex gap-2", className)}>
        <Input
          type="email"
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
        </Button>
      </form>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {title || "Restez informé"}
        </h3>
        <p className="text-muted-foreground">
          {subtitle || "Inscrivez-vous pour recevoir nos derniers articles sur la biodiversité africaine."}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <Input
          type="email"
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Inscription...
            </>
          ) : (
            "S'inscrire"
          )}
        </Button>
      </form>
    </div>
  );
};
