import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const ArticleSkeletonCard = () => {
  return (
    <Card className="overflow-hidden border-0 shadow-natural bg-card/50 backdrop-blur-sm">
      {/* Image skeleton avec animation de shimmer */}
      <div className="relative h-56 overflow-hidden bg-muted">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent skeleton-shimmer" />
        <Skeleton className="h-full w-full rounded-none" />
        
        {/* Badge skeleton */}
        <div className="absolute top-4 left-4">
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
      
      <CardHeader className="space-y-3 pb-2">
        {/* Meta info skeleton (date, read time) */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-20" />
          <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        {/* Title skeleton - 2 lignes */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Excerpt skeleton - 3 lignes */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        {/* Footer skeleton (author, action) */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ArticleSkeletonCard;
