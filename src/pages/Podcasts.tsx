import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Play, ChevronLeft, ChevronRight, Video, Music } from "lucide-react";

interface Podcast {
  id: string;
  title: string;
  description: string;
  image_url: string;
  slug: string;
  duration: number;
  created_at: string;
  media_type: "audio" | "video";
  video_url?: string;
}

const ITEMS_PER_PAGE = 9;

const Podcasts = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [filteredPodcasts, setFilteredPodcasts] = useState<Podcast[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPodcasts();
  }, []);

  useEffect(() => {
    filterPodcasts();
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, podcasts]);

  const fetchPodcasts = async () => {
    try {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPodcasts((data || []) as Podcast[]);
    } catch (error) {
      console.error("Error fetching podcasts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterPodcasts = () => {
    let filtered = [...podcasts];

    if (searchTerm) {
      filtered = filtered.filter(
        (podcast) =>
          podcast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          podcast.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPodcasts(filtered);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredPodcasts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPodcasts = filteredPodcasts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-8">
          Tous les podcasts
        </h1>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher un podcast..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Podcasts grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Chargement des podcasts...
          </div>
        ) : filteredPodcasts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Aucun podcast trouvé
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPodcasts.map((podcast) => (
                <Link key={podcast.id} to={`/podcast/${podcast.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="p-0">
                      <div className="relative aspect-video">
                        <img
                          src={podcast.image_url || "/placeholder.svg"}
                          alt={podcast.title}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          {podcast.media_type === "video" ? (
                            <Video className="h-12 w-12 text-white" />
                          ) : (
                            <Play className="h-12 w-12 text-white" />
                          )}
                        </div>
                        {podcast.media_type === "video" && (
                          <span className="absolute top-2 right-2 bg-highlight text-highlight-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            Vidéo
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {podcast.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {podcast.description}
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <span className="text-sm text-muted-foreground">
                        {podcast.duration ? formatDuration(podcast.duration) : 'Durée inconnue'}
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Podcasts;
