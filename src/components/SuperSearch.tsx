import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Search, X, FileText, Mic, ArrowRight, Command, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────────────────── */
interface RawArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  rubrique: string;
  source_document_url: string | null;
}

interface RawPodcast {
  id: string;
  title: string;
  slug: string;
  description: string;
}

interface SearchResult {
  id: string;
  type: "article" | "podcast";
  title: string;
  slug: string;
  snippet: string;
  rubrique?: string;
  isDocument: boolean;
}

/* ─── Text highlight utility ─────────────────────────────────────────── */
const highlightText = (text: string, query: string): string => {
  if (!query.trim() || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(
    new RegExp(`(${escaped})`, "gi"),
    '<mark class="bg-highlight/20 text-highlight font-semibold not-italic rounded-sm px-0.5">$1</mark>'
  );
};

/** Extracts a snippet around the first occurrence of the query */
const extractSnippet = (text: string, query: string, maxLen = 160): string => {
  if (!text) return "";
  const plain = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const idx = plain.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return plain.slice(0, maxLen);
  const start = Math.max(0, idx - 60);
  const end = Math.min(plain.length, idx + 100);
  const snippet = (start > 0 ? "…" : "") + plain.slice(start, end) + (end < plain.length ? "…" : "");
  return snippet;
};

/* ─── Debounce hook ──────────────────────────────────────────────────── */
const useDebounce = (value: string, delay: number) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

/* ─── Result Item ────────────────────────────────────────────────────── */
const ResultItem = ({
  result,
  query,
  onSelect,
}: {
  result: SearchResult;
  query: string;
  onSelect: () => void;
}) => {
  const highlightedTitle = highlightText(result.title, query);
  const highlightedSnippet = highlightText(result.snippet, query);

  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={`/${result.type === "article" ? "article" : "podcast"}/${result.slug}`}
        onClick={onSelect}
        className="group flex items-start gap-3 px-4 py-3 hover:bg-muted/60 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-ring"
      >
        {/* Icon */}
        <div
          className={cn(
            "mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
            result.type === "article"
              ? "bg-primary/10 text-primary"
              : "bg-secondary/10 text-secondary"
          )}
        >
          {result.type === "article" ? (
            <FileText className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
          ) : (
            <Mic className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          {/* Tags row */}
          <div className="flex items-center gap-2 mb-0.5">
            {result.rubrique && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-highlight">
                {result.rubrique}
              </span>
            )}
            {result.isDocument && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-water bg-water/10 px-1.5 py-0.5 rounded-full">
                PDF/Doc
              </span>
            )}
          </div>

          {/* Title with highlight */}
          <p
            className="text-sm font-serif font-semibold text-foreground leading-snug line-clamp-1"
            dangerouslySetInnerHTML={{ __html: highlightedTitle }}
          />

          {/* Snippet with highlight */}
          {result.snippet && (
            <p
              className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-0.5"
              dangerouslySetInnerHTML={{ __html: highlightedSnippet }}
            />
          )}
        </div>

        {/* Arrow */}
        <ArrowRight
          className="h-4 w-4 text-muted-foreground/30 flex-shrink-0 self-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-[opacity,transform] duration-200"
          aria-hidden="true"
        />
      </Link>
    </motion.li>
  );
};

/* ─── Empty state ────────────────────────────────────────────────────── */
const EmptyState = ({ query }: { query: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="px-6 py-10 text-center"
  >
    <Search className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" strokeWidth={1.2} />
    <p className="text-sm font-medium text-foreground/60">
      Aucun résultat pour{" "}
      <span className="font-serif font-semibold text-foreground">"{query}"</span>
    </p>
    <p className="text-xs text-muted-foreground/50 mt-1">
      Essayez un autre terme ou vérifiez l'orthographe.
    </p>
  </motion.div>
);

/* ─── Main Modal ─────────────────────────────────────────────────────── */
interface SuperSearchProps {
  open: boolean;
  onClose: () => void;
}

export const SuperSearch = ({ open, onClose }: SuperSearchProps) => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Auto-focus on open */
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
      setQuery("");
    }
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  /* Prevent body scroll while open */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* ── Query ── */
  const { data: results = [], isFetching } = useQuery<SearchResult[]>({
    queryKey: ["super-search", debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.trim().length < 2) return [];

      const [articlesRes, podcastsRes] = await Promise.all([
        supabase.rpc("search_articles", { search_query: debouncedQuery }),
        supabase.rpc("search_podcasts", { search_query: debouncedQuery }),
      ]);

      const articleResults: SearchResult[] = ((articlesRes.data ?? []) as RawArticle[])
        .slice(0, 6)
        .map((a) => ({
          id: a.id,
          type: "article" as const,
          title: a.title,
          slug: a.slug,
          rubrique: a.rubrique,
          isDocument: !!a.source_document_url,
          snippet: extractSnippet(
            a.excerpt ?? a.content,
            debouncedQuery
          ),
        }));

      const podcastResults: SearchResult[] = ((podcastsRes.data ?? []) as RawPodcast[])
        .slice(0, 4)
        .map((p) => ({
          id: p.id,
          type: "podcast" as const,
          title: p.title,
          slug: p.slug,
          isDocument: false,
          snippet: extractSnippet(p.description, debouncedQuery),
        }));

      return [...articleResults, ...podcastResults];
    },
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  const handleSelect = useCallback(() => {
    onClose();
    setQuery("");
  }, [onClose]);

  const showResults = debouncedQuery.trim().length >= 2;
  const showEmpty = showResults && !isFetching && results.length === 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-background/50 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[12vh] left-1/2 -translate-x-1/2 z-[101] w-full max-w-2xl px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Recherche rapide"
          >
            <div className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-leaf shadow-elevated overflow-hidden">
              {/* Search input row */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
                {isFetching ? (
                  <Loader2
                    className="h-5 w-5 text-primary animate-spin flex-shrink-0"
                    aria-hidden="true"
                  />
                ) : (
                  <Search
                    className="h-5 w-5 text-muted-foreground flex-shrink-0"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                )}

                <input
                  ref={inputRef}
                  id="super-search-input"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher articles, podcasts, documents…"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none border-0 focus:ring-0"
                  style={{ boxShadow: "none" }}
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Terme de recherche"
                  aria-autocomplete="list"
                  aria-controls="super-search-results"
                />

                {/* Kbd hint + close */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!query && (
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/60 bg-muted rounded border border-border/50">
                      <Command className="h-2.5 w-2.5" />K
                    </kbd>
                  )}
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
                    aria-label="Fermer la recherche"
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
                {!showResults ? (
                  /* Hint state */
                  <div className="px-6 py-8 text-center">
                    <p className="text-xs text-muted-foreground/50">
                      Tapez au moins 2 caractères pour lancer la recherche.
                    </p>
                  </div>
                ) : showEmpty ? (
                  <EmptyState query={debouncedQuery} />
                ) : (
                  <ul
                    id="super-search-results"
                    role="listbox"
                    aria-label="Résultats de recherche"
                    className="py-1 divide-y divide-border/30"
                  >
                    {/* Articles section */}
                    {results.filter((r) => r.type === "article").length > 0 && (
                      <>
                        <li className="px-4 pt-3 pb-1">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                            Articles
                          </span>
                        </li>
                        <AnimatePresence mode="popLayout" initial={false}>
                          {results
                            .filter((r) => r.type === "article")
                            .map((r) => (
                              <ResultItem
                                key={r.id}
                                result={r}
                                query={debouncedQuery}
                                onSelect={handleSelect}
                              />
                            ))}
                        </AnimatePresence>
                      </>
                    )}

                    {/* Podcasts section */}
                    {results.filter((r) => r.type === "podcast").length > 0 && (
                      <>
                        <li className="px-4 pt-3 pb-1">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                            Podcasts
                          </span>
                        </li>
                        <AnimatePresence mode="popLayout" initial={false}>
                          {results
                            .filter((r) => r.type === "podcast")
                            .map((r) => (
                              <ResultItem
                                key={r.id}
                                result={r}
                                query={debouncedQuery}
                                onSelect={handleSelect}
                              />
                            ))}
                        </AnimatePresence>
                      </>
                    )}
                  </ul>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-border/30 bg-muted/20">
                <span className="text-[10px] text-muted-foreground/50">
                  {results.length > 0
                    ? `${results.length} résultat${results.length > 1 ? "s" : ""}`
                    : "Recherche full-text"}
                </span>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground/40 font-mono">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-muted rounded border border-border/50">↵</kbd>
                    Ouvrir
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-muted rounded border border-border/50">Esc</kbd>
                    Fermer
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ─── Hook : Cmd+K / Ctrl+K global shortcut ──────────────────────────── */
export const useSuperSearch = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);

  return { open, openSearch, closeSearch };
};

export { SuperSearch as SuperSearchModal };

export default SuperSearch;
