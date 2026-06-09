import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, MessageSquare, Reply } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  article_id: string | null;
  podcast_id: string | null;
  parent_id: string | null;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
  articles?: {
    title: string;
  } | null;
  podcasts?: {
    title: string;
  } | null;
}

const AdminComments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
    subscribeToComments();
  }, []);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          profiles:profiles!comments_user_id_profiles_fkey(full_name),
          articles(title),
          podcasts(title)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments((data || []) as any);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commentaires",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToComments = () => {
    const channel = supabase
      .channel("admin-comments-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Supprimer ce commentaire et toutes ses réponses ?")) return;
    
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      toast({
        title: "Commentaire supprimé",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le commentaire",
        variant: "destructive",
      });
    }
  };

  // Organize comments: root comments and their replies
  const rootComments = comments.filter((c) => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter((c) => c.parent_id === parentId);
  
  // Group by content (article or podcast)
  const articleComments = rootComments.filter((c) => c.article_id);
  const podcastComments = rootComments.filter((c) => c.podcast_id);

  if (loading) {
    return <div className="animate-pulse">Chargement...</div>;
  }

  const CommentItem = ({ comment }: { comment: Comment }) => {
    const replies = getReplies(comment.id);
    
    return (
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {comment.profiles?.full_name || "Utilisateur"}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Sur: {comment.articles?.title || comment.podcasts?.title || "Contenu supprimé"}
            </p>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(comment.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Supprimer
          </Button>
        </div>
        <p className="text-sm">{comment.content}</p>
        
        {/* Replies */}
        {replies.length > 0 && (
          <div className="ml-4 border-l-2 border-muted pl-4 space-y-3 mt-3">
            {replies.map((reply) => (
              <div key={reply.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Reply className="h-3 w-3 text-muted-foreground" />
                    <span className="font-semibold text-sm">
                      {reply.profiles?.full_name || "Utilisateur"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(reply.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(reply.id)}
                    className="h-7 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm">{reply.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Gestion des commentaires</h2>
        <p className="text-muted-foreground">
          Gérez les commentaires des utilisateurs ({comments.length} total)
        </p>
      </div>

      {/* Article comments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Commentaires sur les articles
            </span>
            <Badge>{articleComments.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {articleComments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun commentaire sur les articles
            </p>
          ) : (
            <div className="space-y-4">
              {articleComments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Podcast comments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Commentaires sur les podcasts
            </span>
            <Badge>{podcastComments.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {podcastComments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun commentaire sur les podcasts
            </p>
          ) : (
            <div className="space-y-4">
              {podcastComments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminComments;
