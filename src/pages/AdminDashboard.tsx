import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { FileText, Headphones, Users, Eye, TrendingUp, Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TopContent {
  id: string;
  title: string;
  views: number;
  avgRating: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    articles: 0,
    podcasts: 0,
    users: 0,
    totalViews: 0,
    pendingArticles: 0,
    pendingPodcasts: 0,
  });
  const [topArticles, setTopArticles] = useState<TopContent[]>([]);
  const [topPodcasts, setTopPodcasts] = useState<TopContent[]>([]);

  useEffect(() => {
    fetchStats();
    fetchTopContent();
  }, []);

  const fetchStats = async () => {
    const [
      articlesRes,
      podcastsRes,
      usersRes,
      articleViewsRes,
      podcastViewsRes,
      pendingArticlesRes,
      pendingPodcastsRes,
    ] = await Promise.all([
      supabase.from("articles").select("*", { count: "exact", head: true }),
      supabase.from("podcasts").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("article_views").select("*", { count: "exact", head: true }),
      supabase.from("podcast_views").select("*", { count: "exact", head: true }),
      supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("published", false),
      supabase
        .from("podcasts")
        .select("*", { count: "exact", head: true })
        .eq("published", false),
    ]);

    setStats({
      articles: articlesRes.count || 0,
      podcasts: podcastsRes.count || 0,
      users: usersRes.count || 0,
      totalViews: (articleViewsRes.count || 0) + (podcastViewsRes.count || 0),
      pendingArticles: pendingArticlesRes.count || 0,
      pendingPodcasts: pendingPodcastsRes.count || 0,
    });
  };

  const fetchTopContent = async () => {
    // Fetch top articles
    const { data: articleViewsData } = await supabase
      .from("article_views")
      .select("article_id, articles!inner(id, title)");

    const { data: articleRatingsData } = await supabase
      .from("article_ratings")
      .select("article_id, rating");

    if (articleViewsData) {
      const articleStats = articleViewsData.reduce((acc: any, view: any) => {
        const articleId = view.article_id;
        if (!acc[articleId]) {
          acc[articleId] = {
            id: articleId,
            title: view.articles.title,
            views: 0,
          };
        }
        acc[articleId].views++;
        return acc;
      }, {});

      // Add ratings
      articleRatingsData?.forEach((rating: any) => {
        if (articleStats[rating.article_id]) {
          if (!articleStats[rating.article_id].ratings) {
            articleStats[rating.article_id].ratings = [];
          }
          articleStats[rating.article_id].ratings.push(rating.rating);
        }
      });

      const topArticlesData = Object.values(articleStats)
        .map((article: any) => ({
          ...article,
          avgRating: article.ratings
            ? article.ratings.reduce((a: number, b: number) => a + b, 0) /
              article.ratings.length
            : 0,
        }))
        .sort((a: any, b: any) => b.views - a.views)
        .slice(0, 5);

      setTopArticles(topArticlesData as TopContent[]);
    }

    // Fetch top podcasts
    const { data: podcastViewsData } = await supabase
      .from("podcast_views")
      .select("podcast_id, podcasts!inner(id, title)");

    const { data: podcastRatingsData } = await supabase
      .from("podcast_ratings")
      .select("podcast_id, rating");

    if (podcastViewsData) {
      const podcastStats = podcastViewsData.reduce((acc: any, view: any) => {
        const podcastId = view.podcast_id;
        if (!acc[podcastId]) {
          acc[podcastId] = {
            id: podcastId,
            title: view.podcasts.title,
            views: 0,
          };
        }
        acc[podcastId].views++;
        return acc;
      }, {});

      // Add ratings
      podcastRatingsData?.forEach((rating: any) => {
        if (podcastStats[rating.podcast_id]) {
          if (!podcastStats[rating.podcast_id].ratings) {
            podcastStats[rating.podcast_id].ratings = [];
          }
          podcastStats[rating.podcast_id].ratings.push(rating.rating);
        }
      });

      const topPodcastsData = Object.values(podcastStats)
        .map((podcast: any) => ({
          ...podcast,
          avgRating: podcast.ratings
            ? podcast.ratings.reduce((a: number, b: number) => a + b, 0) /
              podcast.ratings.length
            : 0,
        }))
        .sort((a: any, b: any) => b.views - a.views)
        .slice(0, 5);

      setTopPodcasts(topPodcastsData as TopContent[]);
    }
  };

  const statCards = [
    {
      title: "Articles",
      value: stats.articles,
      icon: FileText,
      color: "text-primary",
      subtitle: `${stats.pendingArticles} en attente`,
    },
    {
      title: "Podcasts",
      value: stats.podcasts,
      icon: Headphones,
      color: "text-secondary",
      subtitle: `${stats.pendingPodcasts} en attente`,
    },
    {
      title: "Utilisateurs",
      value: stats.users,
      icon: Users,
      color: "text-accent",
    },
    {
      title: "Vues totales",
      value: stats.totalViews,
      icon: Eye,
      color: "text-primary",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
          Tableau de bord
        </h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre plateforme
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  {stat.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.subtitle}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-serif font-bold text-foreground">
              Articles les plus consultés
            </h2>
          </div>
          {topArticles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead className="text-right">Vues</TableHead>
                  <TableHead className="text-right">Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">
                      {article.title}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        {article.views}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        {article.avgRating > 0
                          ? article.avgRating.toFixed(1)
                          : "-"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Aucune donnée disponible
            </p>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-secondary" />
            <h2 className="text-2xl font-serif font-bold text-foreground">
              Podcasts les plus écoutés
            </h2>
          </div>
          {topPodcasts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead className="text-right">Écoutes</TableHead>
                  <TableHead className="text-right">Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPodcasts.map((podcast) => (
                  <TableRow key={podcast.id}>
                    <TableCell className="font-medium">
                      {podcast.title}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Headphones className="h-4 w-4 text-muted-foreground" />
                        {podcast.views}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        {podcast.avgRating > 0
                          ? podcast.avgRating.toFixed(1)
                          : "-"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Aucune donnée disponible
            </p>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
          Bienvenue dans l'espace d'administration
        </h2>
        <p className="text-muted-foreground mb-4">
          En tant qu'administrateur, vous pouvez :
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Valider et publier les articles soumis par les éditeurs
          </li>
          <li className="flex items-center">
            <Headphones className="mr-2 h-4 w-4" />
            Valider et publier les podcasts soumis par les éditeurs
          </li>
          <li className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Gérer les rôles et permissions (ajouter/modifier/supprimer des éditeurs)
          </li>
          <li className="flex items-center">
            <Eye className="mr-2 h-4 w-4" />
            Consulter les statistiques de consultation et les notes
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default AdminDashboard;
