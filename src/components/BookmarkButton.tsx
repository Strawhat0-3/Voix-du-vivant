import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  articleId?: string;
  podcastId?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export const BookmarkButton = ({
  articleId,
  podcastId,
  size = 'default',
  variant = 'outline',
  className,
}: BookmarkButtonProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const checkBookmark = async () => {
      const query = supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id);

      if (articleId) {
        query.eq('article_id', articleId);
      } else if (podcastId) {
        query.eq('podcast_id', podcastId);
      }

      const { data } = await query.maybeSingle();
      setIsBookmarked(!!data);
    };

    checkBookmark();
  }, [user, articleId, podcastId]);

  const handleToggleBookmark = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous pour sauvegarder ce contenu.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isBookmarked) {
        // Remove bookmark
        const query = supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id);

        if (articleId) {
          query.eq('article_id', articleId);
        } else if (podcastId) {
          query.eq('podcast_id', podcastId);
        }

        const { error } = await query;
        if (error) throw error;

        setIsBookmarked(false);
        toast({
          title: "Retiré des favoris",
          description: "Ce contenu a été retiré de vos favoris.",
        });
      } else {
        // Add bookmark
        const bookmarkData: any = {
          user_id: user.id,
        };

        if (articleId) {
          bookmarkData.article_id = articleId;
        } else if (podcastId) {
          bookmarkData.podcast_id = podcastId;
        }

        const { error } = await supabase
          .from('bookmarks')
          .insert(bookmarkData);

        if (error) throw error;

        setIsBookmarked(true);
        toast({
          title: "Ajouté aux favoris",
          description: "Ce contenu a été ajouté à vos favoris.",
        });
      }
    } catch (error) {
      console.error('Bookmark error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier les favoris.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';

  return (
    <Button
      variant={variant}
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
      onClick={handleToggleBookmark}
      disabled={isLoading}
      className={cn(
        isBookmarked && 'text-primary border-primary',
        className
      )}
      title={isBookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      {isBookmarked ? (
        <BookmarkCheck className={cn(iconSize, 'fill-current')} />
      ) : (
        <Bookmark className={iconSize} />
      )}
      <span className="ml-2 hidden sm:inline">
        {isBookmarked ? 'Sauvegardé' : 'Sauvegarder'}
      </span>
    </Button>
  );
};
