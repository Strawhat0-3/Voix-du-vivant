import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";

const PodcastSection = () => {
  const { play } = useAudioPlayer();

  // ✅ TanStack Query — staleTime 5 min, pas de refetch inutile
  const { data: latest } = useQuery({
    queryKey: ["podcast-latest-audio"],
    queryFn: async () => {
      const { data } = await supabase
        .from("podcasts")
        .select("id, title, description, audio_url, image_url, slug")
        .eq("published", true)          // ✅ Publiés uniquement — sécurité front/back
        .eq("media_type", "audio")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data ?? null;
    },
    staleTime: 1000 * 60 * 5,           // 5 min — évite les refetch inutiles
    gcTime: 1000 * 60 * 30,             // 30 min en cache mémoire
    refetchOnWindowFocus: false,        // Pas de refetch au focus onglet
  });

  const title = latest?.title ?? "Les Gardiens de la Forêt";
  const description =
    latest?.description ??
    "Découvrez les initiatives locales qui protègent les dernières forêts primaires d'Afrique centrale. Un voyage sonore au cœur de la biodiversité.";

  return (
    <section className="py-20 gradient-earth">
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden border-0 shadow-elevated">
            <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-secondary">
                  <Headphones className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase tracking-wider">
                    Podcast du moment
                  </span>
                </div>
                <h2 className="text-4xl font-serif font-bold text-foreground">
                  {title}
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed line-clamp-4">
                  {description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                    onClick={() =>
                      latest &&
                      play({
                        id: latest.id,
                        title: latest.title,
                        audioUrl: latest.audio_url,
                        imageUrl: latest.image_url ?? undefined,
                        slug: latest.slug,
                      })
                    }
                    disabled={!latest}
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Écouter maintenant
                  </Button>
                  <Link to="/podcasts">
                    <Button size="lg" variant="outline">
                      Tous les podcasts
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <Link to="/podcasts" className="relative w-full aspect-square max-w-sm group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full opacity-20 animate-pulse" />
                  <div className="absolute inset-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-elevated group-hover:scale-105 transition-smooth">
                    <Play className="h-16 w-16 text-primary-foreground" />
                  </div>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PodcastSection;
