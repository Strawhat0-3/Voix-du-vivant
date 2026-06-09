import { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Mic } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  type: 'article' | 'podcast';
  excerpt?: string;
  description?: string;
}

interface SearchBarProps {
  className?: string;
  onClose?: () => void;
  fullWidth?: boolean;
}

export const SearchBar = ({ className, onClose, fullWidth = false }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchContent = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        // Search articles
        const { data: articles } = await supabase
          .rpc('search_articles', { search_query: query });

        // Search podcasts
        const { data: podcasts } = await supabase
          .rpc('search_podcasts', { search_query: query });

        const articleResults: SearchResult[] = (articles || []).slice(0, 5).map((a: any) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          type: 'article' as const,
          excerpt: a.excerpt,
        }));

        const podcastResults: SearchResult[] = (podcasts || []).slice(0, 5).map((p: any) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          type: 'podcast' as const,
          description: p.description,
        }));

        setResults([...articleResults, ...podcastResults]);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchContent, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  const handleResultClick = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onClose?.();
  };

  return (
    <div ref={containerRef} className={cn("relative", fullWidth ? "w-full" : "w-full max-w-md", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Rechercher articles, podcasts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="pl-10 pr-10 bg-background/50 border-border/50 focus:border-primary"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && (query.length >= 2) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Recherche en cours...
            </div>
          ) : results.length > 0 ? (
            <ul className="max-h-[400px] overflow-y-auto">
              {results.map((result) => (
                <li key={`${result.type}-${result.id}`}>
                  <Link
                    to={`/${result.type}/${result.slug}`}
                    onClick={handleResultClick}
                    className="flex items-start gap-3 p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="mt-1">
                      {result.type === 'article' ? (
                        <FileText className="h-4 w-4 text-primary" />
                      ) : (
                        <Mic className="h-4 w-4 text-secondary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {result.title}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {result.type === 'article' ? result.excerpt : result.description}
                      </p>
                      <span className="text-xs text-primary/70 uppercase">
                        {result.type === 'article' ? 'Article' : 'Podcast'}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              Aucun résultat pour "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
