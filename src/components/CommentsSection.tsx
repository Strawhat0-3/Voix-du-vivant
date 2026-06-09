import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, MessageCircle, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────────────────── */
interface Comment {
  id: string;
  content: string;
  display_name: string | null;
  user_id: string | null;
  created_at: string;
  approved: boolean;
}

interface Reaction {
  id: string;
  comment_id: string;
  user_id: string | null;
  reaction_type: string;
}

interface CommentsSectionProps {
  articleId?: string;
  podcastId?: string;
}

/* ─── Palette d'avatars africaine ────────────────────────────────────── */
const AVATAR_PALETTE = [
  { bg: "hsl(24 65% 38%)",  fg: "#fff" },   // Terre de Sienne
  { bg: "hsl(158 45% 28%)", fg: "#fff" },   // Forêt Équatoriale
  { bg: "hsl(18 90% 52%)",  fg: "#fff" },   // Soleil Couchant
  { bg: "hsl(200 55% 35%)", fg: "#fff" },   // Fleuve Congo
  { bg: "hsl(38 55% 45%)",  fg: "#fff" },   // Ocre Savane
  { bg: "hsl(355 65% 40%)", fg: "#fff" },   // Baobab Rouge
];

const getAvatarColor = (name: string) => {
  const idx = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
};

const getInitial = (name: string | null) =>
  (name?.trim()?.[0] ?? "?").toUpperCase();

/* ─── Avatar Component ───────────────────────────────────────────────── */
const AnonAvatar = ({ name }: { name: string | null }) => {
  const displayName = name || "?";
  const { bg, fg } = getAvatarColor(displayName);
  return (
    <div
      className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-serif font-bold text-sm select-none"
      style={{ background: bg, color: fg }}
      aria-hidden="true"
    >
      {getInitial(displayName)}
    </div>
  );
};

/* ─── Auto-resize textarea hook ──────────────────────────────────────── */
const useAutoResize = () => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);
  return { ref, resize };
};

/* ─── Comment Form ───────────────────────────────────────────────────── */
interface CommentFormProps {
  articleId?: string;
  podcastId?: string;
  onSuccess: () => void;
}

const CommentForm = ({ articleId, podcastId, onSuccess }: CommentFormProps) => {
  const [pseudo, setPseudo] = useState("");
  const [message, setMessage] = useState("");
  const [pseudoFocused, setPseudoFocused] = useState(false);
  const [msgFocused, setMsgFocused] = useState(false);
  const { ref: textareaRef, resize } = useAutoResize();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!message.trim()) throw new Error("Message vide");
      const { error } = await supabase.from("comments").insert({
        content: message.trim(),
        display_name: pseudo.trim() || "Lecteur anonyme",
        user_id: null,          // Anonyme — pas besoin d'être connecté
        article_id: articleId ?? null,
        podcast_id: podcastId ?? null,
        parent_id: null,
        approved: false,        // ✅ Toujours pending review — sécurité DB + RLS
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setPseudo("");
      setMessage("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      toast.success("✨ Merci ! Votre message est en route.", {
        description: "Il sera affiché après validation de l'équipe.",
        duration: 5000,
        style: {
          fontFamily: "'Inter', sans-serif",
          background: "hsl(42 40% 96%)",
          border: "1px solid hsl(35 20% 82%)",
          color: "hsl(30 20% 12%)",
        },
      });
      onSuccess();
    },
    onError: () => {
      toast.error("Impossible d'envoyer votre commentaire.", {
        description: "Réessayez dans quelques instants.",
      });
    },
  });

  const isValid = message.trim().length >= 3;

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
      className="space-y-5"
      aria-label="Formulaire de commentaire"
      noValidate
    >
      {/* Pseudo field */}
      <div className="relative">
        <input
          id="comment-pseudo"
          type="text"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          onFocus={() => setPseudoFocused(true)}
          onBlur={() => setPseudoFocused(false)}
          placeholder="Votre prénom ou pseudo"
          maxLength={60}
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 pt-1 pb-2 outline-none border-0 focus:ring-0"
          style={{ boxShadow: "none" }}
          autoComplete="nickname"
        />
        {/* Static underline */}
        <div className="absolute bottom-0 left-0 h-px w-full bg-border" aria-hidden="true" />
        {/* Animated focus underline */}
        <motion.div
          className="absolute bottom-0 left-0 h-px bg-primary origin-left"
          animate={{ scaleX: pseudoFocused ? 1 : 0 }}
          initial={{ scaleX: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: "100%" }}
          aria-hidden="true"
        />
      </div>

      {/* Message field — auto-resize, no scrollbar */}
      <div className="relative">
        <label htmlFor="comment-message" className="sr-only">Votre commentaire</label>
        <textarea
          id="comment-message"
          ref={textareaRef}
          value={message}
          onChange={(e) => { setMessage(e.target.value); resize(); }}
          onFocus={() => setMsgFocused(true)}
          onBlur={() => setMsgFocused(false)}
          placeholder="Votre mot..."
          rows={2}
          maxLength={1200}
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 pt-1 pb-2 outline-none border-0 resize-none overflow-hidden focus:ring-0 leading-relaxed"
          style={{ boxShadow: "none", minHeight: "3rem" }}
        />
        {/* Static underline */}
        <div className="absolute bottom-0 left-0 h-px w-full bg-border" aria-hidden="true" />
        {/* Animated highlight underline */}
        <motion.div
          className="absolute bottom-0 left-0 h-px bg-highlight origin-left"
          animate={{ scaleX: msgFocused ? 1 : 0 }}
          initial={{ scaleX: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: "100%" }}
          aria-hidden="true"
        />
      </div>

      {/* Submit row */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <p className="text-xs text-muted-foreground/60 leading-snug max-w-[18rem]">
          Votre message sera affiché après validation de l'équipe.
        </p>
        <motion.button
          type="submit"
          disabled={!isValid || mutation.isPending}
          whileTap={{ scale: 0.96 }}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-[background,opacity] duration-300",
            isValid && !mutation.isPending
              ? "bg-primary text-primary-foreground shadow-natural hover:brightness-110"
              : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
          )}
          aria-label="Envoyer le commentaire"
        >
          <Send className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          {mutation.isPending ? "Envoi…" : "Envoyer"}
        </motion.button>
      </div>
    </motion.form>
  );
};

/* ─── Heart Reaction Button ──────────────────────────────────────────── */
const HeartButton = ({
  commentId,
  count,
}: {
  commentId: string;
  count: number;
}) => {
  const [localCount, setLocalCount] = useState(count);
  const [reacted, setReacted] = useState(false);

  useEffect(() => { setLocalCount(count); }, [count]);

  const handleClick = async () => {
    if (reacted) return; // Anon : un cœur par session (optimiste)
    setReacted(true);
    setLocalCount((c) => c + 1);
    try {
      await supabase.from("comment_reactions").insert({
        comment_id: commentId,
        user_id: null,
        reaction_type: "heart",
      });
    } catch {
      // Rollback silencieux
      setReacted(false);
      setLocalCount((c) => Math.max(0, c - 1));
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.85 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-[background,color] duration-200",
        reacted
          ? "bg-highlight/10 text-highlight"
          : "text-muted-foreground/60 hover:text-highlight hover:bg-highlight/10"
      )}
      aria-label={reacted ? "Coup de cœur donné" : "Donner un coup de cœur"}
      aria-pressed={reacted}
    >
      <Heart
        className={cn(
          "h-3.5 w-3.5 transition-transform duration-200",
          reacted && "fill-current scale-110"
        )}
        strokeWidth={1.8}
        aria-hidden="true"
      />
      {localCount > 0 && <span className="tabular-nums">{localCount}</span>}
    </motion.button>
  );
};

/* ─── Comment Item ───────────────────────────────────────────────────── */
const CommentItem = ({
  comment,
  reactions,
}: {
  comment: Comment;
  reactions: Reaction[];
}) => {
  const heartCount = reactions.filter(
    (r) => r.comment_id === comment.id && r.reaction_type === "heart"
  ).length;

  const displayName = comment.display_name || "Lecteur anonyme";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex gap-4 py-6 border-b border-border/40 last:border-0 first:pt-0"
      role="article"
    >
      {/* Avatar */}
      <AnonAvatar name={displayName} />

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Author + time */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-serif font-semibold text-sm text-foreground leading-none">
            {displayName}
          </span>
          <time
            dateTime={comment.created_at}
            className="text-xs text-muted-foreground/60"
          >
            {formatDistanceToNow(new Date(comment.created_at), {
              addSuffix: true,
              locale: fr,
            })}
          </time>
        </div>

        {/* Comment body */}
        <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap break-words">
          {comment.content}
        </p>

        {/* Heart reaction */}
        <div className="flex items-center gap-1 pt-0.5">
          <HeartButton commentId={comment.id} count={heartCount} />
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Loading Skeleton ───────────────────────────────────────────────── */
const CommentSkeleton = () => (
  <div className="flex gap-4 py-6 border-b border-border/40 animate-pulse">
    <div className="w-9 h-9 rounded-full bg-muted flex-shrink-0" />
    <div className="flex-1 space-y-2.5">
      <div className="flex items-center gap-2">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);

/* ─── Main CommentsSection ───────────────────────────────────────────── */
export const CommentsSection = ({ articleId, podcastId }: CommentsSectionProps) => {
  const queryClient = useQueryClient();
  const contentKey = articleId ? `article-${articleId}` : `podcast-${podcastId}`;

  /* ── Fetch approved comments only ── */
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", contentKey],
    queryFn: async () => {
      let q = supabase
        .from("comments")
        .select("id, content, display_name, user_id, created_at, approved")
        .eq("approved", true)           // ✅ Filtre strict — jamais de brouillons
        .is("parent_id", null)
        .order("created_at", { ascending: false });

      if (articleId) q = q.eq("article_id", articleId);
      else if (podcastId) q = q.eq("podcast_id", podcastId);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Comment[];
    },
    staleTime: 1000 * 60 * 2,          // 2 min — commentaires plus dynamiques
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  /* ── Fetch reactions ── */
  const { data: reactions = [] } = useQuery({
    queryKey: ["comment-reactions", contentKey],
    queryFn: async () => {
      if (comments.length === 0) return [];
      const ids = comments.map((c) => c.id);
      const { data, error } = await supabase
        .from("comment_reactions")
        .select("id, comment_id, user_id, reaction_type")
        .in("comment_id", ids);
      if (error) throw error;
      return (data ?? []) as Reaction[];
    },
    enabled: comments.length > 0,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  /* ── Realtime subscription ── */
  useEffect(() => {
    const channel = supabase
      .channel(`comments-rt-${contentKey}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, () => {
        queryClient.invalidateQueries({ queryKey: ["comments", contentKey] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "comment_reactions" }, () => {
        queryClient.invalidateQueries({ queryKey: ["comment-reactions", contentKey] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [contentKey, queryClient]);

  const handleFormSuccess = useCallback(() => {
    // Comments go to moderation — no optimistic display
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto py-10"
      aria-labelledby="comments-heading"
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
        <h3 id="comments-heading" className="font-serif font-semibold text-lg text-foreground">
          Discussion
          {comments.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({comments.length})
            </span>
          )}
        </h3>
      </div>

      {/* ── Form block ── */}
      <div
        className="mb-12 p-6 bg-card border border-border/40 rounded-leaf shadow-natural"
        role="complementary"
        aria-label="Laisser un commentaire"
      >
        <p className="text-overline text-xs text-muted-foreground tracking-widest mb-5">
          Votre réaction
        </p>
        <CommentForm articleId={articleId} podcastId={podcastId} onSuccess={handleFormSuccess} />
      </div>

      {/* ── Comment list with AnimatePresence ── */}
      <div role="feed" aria-label="Commentaires approuvés" aria-busy={commentsLoading}>
        {commentsLoading ? (
          <>
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
          </>
        ) : comments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-14 text-center space-y-1"
          >
            <p className="font-serif text-foreground/40 text-base">
              Aucun commentaire pour l'instant.
            </p>
            <p className="text-xs text-muted-foreground/40">
              Soyez le premier à laisser votre empreinte !
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} reactions={reactions} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.section>
  );
};

export default CommentsSection;
