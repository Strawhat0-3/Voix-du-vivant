import { useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface RatingStarsProps {
  contentId: string;
  contentType: "article" | "podcast";
  currentRating?: number;
  averageRating?: number;
  totalRatings?: number;
  onRatingUpdate?: () => void;
}

export const RatingStars = ({
  contentId,
  contentType,
  currentRating = 0,
  averageRating = 0,
  totalRatings = 0,
  onRatingUpdate,
}: RatingStarsProps) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleRating = async (rating: number) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour noter",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const table = contentType === "article" ? "article_ratings" : "podcast_ratings";
    const idField = contentType === "article" ? "article_id" : "podcast_id";

    try {
      // Check if user already rated
      const { data: existingRating } = await supabase
        .from(table as any)
        .select("*")
        .eq(idField, contentId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingRating) {
        // Update existing rating
        const { error } = await supabase
          .from(table as any)
          .update({ rating } as any)
          .eq(idField, contentId)
          .eq("user_id", user.id);

        if (error) throw error;
        
        toast({
          title: "Note mise à jour",
          description: `Vous avez donné ${rating} étoile${rating > 1 ? "s" : ""}`,
        });
      } else {
        // Insert new rating
        const insertData = {
          [idField]: contentId,
          user_id: user.id,
          rating,
        };
        
        const { error } = await supabase.from(table as any).insert([insertData as any]);

        if (error) throw error;
        
        toast({
          title: "Merci pour votre note !",
          description: `Vous avez donné ${rating} étoile${rating > 1 ? "s" : ""}`,
        });
      }

      onRatingUpdate?.();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled =
            hoveredRating > 0
              ? star <= hoveredRating
              : currentRating > 0
              ? star <= currentRating
              : star <= Math.round(averageRating);

          return (
            <button
              key={star}
              onClick={() => handleRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              disabled={isSubmitting}
              className="transition-all hover:scale-110 disabled:opacity-50"
            >
              <Star
                className={`h-5 w-5 transition-colors ${
                  isFilled
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          );
        })}
      </div>
      {totalRatings > 0 && (
        <p className="text-sm text-muted-foreground">
          {averageRating.toFixed(1)} / 5 ({totalRatings} note{totalRatings > 1 ? "s" : ""})
        </p>
      )}
    </div>
  );
};
