import { memo, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import OptimizedImage from "./OptimizedImage";

interface ArticleCardProps {
  title: string;
  excerpt: string;
  image: string;
  category: string;
  readTime: string;
  date: string;
  slug?: string;
}

const ArticleCard = memo(({
  title,
  excerpt,
  image,
  category,
  readTime,
  date,
  slug,
}: ArticleCardProps) => {
  const linkPath = useMemo(() => 
    slug ? `/article/${slug}` : "/articles", 
    [slug]
  );

  return (
    <Link 
      to={linkPath} 
      className="block h-full group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
      aria-label={`Lire l'article: ${title}`}
    >
      <Card className="overflow-hidden border border-border/40 bg-card hover-lift h-full flex flex-col rounded-leaf transition-shadow duration-300 group-focus-visible:ring-2 group-focus-visible:ring-ring">
        {/* Image avec overlay au hover */}
        <div className="relative h-56 overflow-hidden rounded-leaf-reverse m-2 mb-0">
          <OptimizedImage
            src={image}
            alt=""
            aria-hidden="true"
            className="h-full w-full transition-transform duration-500 group-hover:scale-110"
          />
          {/* Overlay gradient au hover */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
            aria-hidden="true"
          />
          
          {/* Badge catégorie stylisé */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-highlight text-highlight-foreground shadow-natural font-semibold text-overline px-3 py-1.5 rounded-full border-0">
              {category}
            </Badge>
          </div>

          {/* Flèche au hover */}
          <div 
            className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
            aria-hidden="true"
          >
            <div className="bg-highlight text-highlight-foreground p-2 rounded-full shadow-glow">
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </div>
          </div>
        </div>
        
        {/* Contenu */}
        <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
          <h3 className="text-xl font-serif font-semibold line-clamp-2 group-hover:text-highlight transition-colors duration-300 leading-tight">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed flex-1">
            {excerpt}
          </p>
          
          {/* Meta infos avec séparateur visuel */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50 text-meta">
            <time dateTime={date} className="text-foreground/70">
              {date}
            </time>
            <div className="flex items-center gap-1.5 text-primary">
              <Clock className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              <span className="font-medium">{readTime}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

ArticleCard.displayName = "ArticleCard";

export default ArticleCard;
