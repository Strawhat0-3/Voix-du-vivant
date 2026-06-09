import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, FileText, Headphones, Eye } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";

interface PendingArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  rubrique: string;
  created_at: string;
  author_id: string;
  profiles?: {
    full_name: string;
  } | null;
}

interface PendingPodcast {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  image_url: string;
  duration: number;
  created_at: string;
  author_id: string;
  profiles?: {
    full_name: string;
  } | null;
}

const AdminModeration = () => {
  const [pendingArticles, setPendingArticles] = useState<PendingArticle[]>([]);
  const [pendingPodcasts, setPendingPodcasts] = useState<PendingPodcast[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingContent();
  }, []);

  const fetchPendingContent = async () => {
    const [articlesRes, podcastsRes] = await Promise.all([
      supabase
        .from("articles")
        .select("*")
        .eq("published", false)
        .order("created_at", { ascending: false }),
      supabase
        .from("podcasts")
        .select("*")
        .eq("published", false)
        .order("created_at", { ascending: false }),
    ]);

    if (articlesRes.error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les articles en attente",
        variant: "destructive",
      });
    } else {
      setPendingArticles(articlesRes.data as any || []);
    }

    if (podcastsRes.error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les podcasts en attente",
        variant: "destructive",
      });
    } else {
      setPendingPodcasts(podcastsRes.data as any || []);
    }
  };

  const handleApproveArticle = async (id: string) => {
    const { error } = await supabase
      .from("articles")
      .update({ published: true })
      .eq("id", id);

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Article approuvé",
      description: "L'article a été publié avec succès",
    });
    fetchPendingContent();
  };

  const handleRejectArticle = async (id: string) => {
    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Article rejeté",
      description: "L'article a été supprimé",
    });
    fetchPendingContent();
  };

  const handleApprovePodcast = async (id: string) => {
    const { error } = await supabase
      .from("podcasts")
      .update({ published: true })
      .eq("id", id);

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Podcast approuvé",
      description: "Le podcast a été publié avec succès",
    });
    fetchPendingContent();
  };

  const handleRejectPodcast = async (id: string) => {
    const { error } = await supabase.from("podcasts").delete().eq("id", id);

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Podcast rejeté",
      description: "Le podcast a été supprimé",
    });
    fetchPendingContent();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Clock className="h-8 w-8 text-primary" />
        <h1 className="text-4xl font-serif font-bold text-foreground">
          Modération des contenus
        </h1>
      </div>

      <Card className="p-6">
        <p className="text-muted-foreground">
          Validez ou rejetez les contenus soumis par les éditeurs. Une fois
          approuvés, ils seront visibles par tous les visiteurs.
        </p>
      </Card>

      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Articles ({pendingArticles.length})
          </TabsTrigger>
          <TabsTrigger value="podcasts" className="flex items-center gap-2">
            <Headphones className="h-4 w-4" />
            Podcasts ({pendingPodcasts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4">
          {pendingArticles.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                Aucun article en attente de validation
              </p>
            </Card>
          ) : (
            pendingArticles.map((article) => (
              <Card key={article.id} className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{article.rubrique}</Badge>
                      <span className="text-sm text-muted-foreground">
                        •{" "}
                        {new Date(article.created_at).toLocaleDateString(
                          "fr-FR"
                        )}
                      </span>
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground">{article.excerpt}</p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Prévisualiser
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{article.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {article.image_url && (
                            <img src={article.image_url} alt={article.title} className="w-full rounded-lg" />
                          )}
                          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }} className="prose max-w-none" />
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      onClick={() => handleApproveArticle(article.id)}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approuver
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleRejectArticle(article.id)}
                      className="flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Rejeter
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="podcasts" className="space-y-4">
          {pendingPodcasts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                Aucun podcast en attente de validation
              </p>
            </Card>
          ) : (
            pendingPodcasts.map((podcast) => (
              <Card key={podcast.id} className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-muted-foreground">
                        {new Date(podcast.created_at).toLocaleDateString(
                          "fr-FR"
                        )}
                      </span>
                      {podcast.duration && (
                        <span className="text-sm text-muted-foreground">
                          • {Math.floor(podcast.duration / 60)}:
                          {(podcast.duration % 60)
                            .toString()
                            .padStart(2, "0")}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
                      {podcast.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {podcast.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Prévisualiser
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{podcast.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {podcast.image_url && (
                            <img src={podcast.image_url} alt={podcast.title} className="w-full rounded-lg" />
                          )}
                          <audio controls className="w-full">
                            <source src={podcast.audio_url} type="audio/mpeg" />
                          </audio>
                          <p className="prose max-w-none">{podcast.description}</p>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      onClick={() => handleApprovePodcast(podcast.id)}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approuver
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleRejectPodcast(podcast.id)}
                      className="flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Rejeter
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminModeration;
