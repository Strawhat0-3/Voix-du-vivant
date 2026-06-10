import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "./Header";
import Footer from "./Footer";
import ClapButton from "./ClapButton";
import { CommentsSection } from "./CommentsSection";
import { useTrackView } from "@/hooks/useTrackView";
import { ArrowLeft, Calendar, Clock, Video, Music } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "@/components/ui/card";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Play } from "lucide-react";

interface Podcast {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  video_url?: string;
  media_type: "audio" | "video";
  image_url: string;
  duration: number;
  created_at: string;
  author_id: string;
  profiles?: {
    full_name: string;
  };
}

interface PodcastRating {
  avgRating: number;
  totalRatings: number;
  userRating: number;
}

export const PodcastView = () => {
  const { slug } = useParams<{ slug: string }>();
  const { play } = useAudioPlayer();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [rating, setRating] = useState<PodcastRating>({
    avgRating: 0,
    totalRatings: 0,
    userRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useTrackView({
    contentId: podcast?.id || "",
    contentType: "podcast",
    enabled: !!podcast?.id,
  });

  useEffect(() => {
    if (slug) {
      fetchPodcast();
    }
  }, [slug]);

  const fetchPodcast = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("podcasts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)    // ✅ Podcasts publiés uniquement — jamais de brouillons en public
      .maybeSingle();

    if (!error && data) {
      setPodcast(data as any);
      fetchRating(data.id);
    }
    setLoading(false);
  };

  const fetchRating = async (podcastId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const [ratingsRes, userRatingRes] = await Promise.all([
      supabase.from("podcast_ratings").select("rating").eq("podcast_id", podcastId),
      user
        ? supabase
            .from("podcast_ratings")
            .select("rating")
            .eq("podcast_id", podcastId)
            .eq("user_id", user.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    if (ratingsRes.data) {
      const ratings = ratingsRes.data.map((r) => r.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;

      setRating({
        avgRating,
        totalRatings: ratings.length,
        userRating: userRatingRes.data?.rating || 0,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Podcast non trouvé</p>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isVideo = podcast.media_type === "video" && podcast.video_url;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <article className="container mx-auto px-4 py-8 max-w-4xl">
          <Link to="/podcasts">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux podcasts
            </Button>
          </Link>

          <div className="flex items-center gap-2 mb-4">
            {isVideo ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-highlight/10 text-highlight text-sm font-medium">
                <Video className="h-4 w-4" />
                Vidéo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-water/10 text-water text-sm font-medium">
                <Music className="h-4 w-4" />
                Audio
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            {podcast.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(podcast.created_at).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            {podcast.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration(podcast.duration)}
              </div>
            )}
          </div>

          {/* Video or Image */}
          {isVideo ? (
            <Card className="p-0 mb-8 overflow-hidden">
              <video 
                controls 
                className="w-full aspect-video"
                poster={podcast.image_url}
              >
                <source src={podcast.video_url} type="video/mp4" />
                Votre navigateur ne supporte pas l'élément vidéo.
              </video>
            </Card>
          ) : (
            <>
              {podcast.image_url && (
                <img
                  src={podcast.image_url}
                  alt={podcast.title}
                  className="w-full h-96 object-cover rounded-lg mb-8"
                />
              )}
              <Card className="p-6 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Button
                    size="lg"
                    onClick={() =>
                      play({
                        id: podcast.id,
                        title: podcast.title,
                        audioUrl: podcast.audio_url,
                        imageUrl: podcast.image_url,
                        slug,
                      })
                    }
                    className="shadow-natural"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Lancer la lecture
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Le lecteur reste accessible en bas de l'écran pendant votre navigation.
                  </p>
                </div>
                <audio controls className="w-full mt-4">
                  <source src={podcast.audio_url} type="audio/mpeg" />
                  Votre navigateur ne supporte pas l'élément audio.
                </audio>
              </Card>
            </>
          )}

          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-lg text-muted-foreground">{podcast.description}</p>
          </div>

          <div className="mt-8 pt-8 border-t flex items-center justify-center">
            <ClapButton contentId={podcast.id} contentType="podcast" />
          </div>

          <div className="mt-8">
            <CommentsSection podcastId={podcast.id} />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};
