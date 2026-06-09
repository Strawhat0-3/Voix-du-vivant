import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseTrackViewOptions {
  contentId: string;
  contentType: "article" | "podcast";
  enabled?: boolean;
}

export const useTrackView = ({ contentId, contentType, enabled = true }: UseTrackViewOptions) => {
  useEffect(() => {
    if (!enabled || !contentId) return;

    const trackView = async () => {
      const table = contentType === "article" ? "article_views" : "podcast_views";
      const idField = contentType === "article" ? "article_id" : "podcast_id";

      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();

      // Get user agent and IP would be handled server-side in production
      const viewData = {
        [idField]: contentId,
        user_id: user?.id || null,
        user_agent: navigator.userAgent,
      };

      await supabase.from(table as any).insert([viewData as any]);
    };

    // Track view after a short delay to avoid tracking quick page navigations
    const timer = setTimeout(trackView, 2000);

    return () => clearTimeout(timer);
  }, [contentId, contentType, enabled]);
};
