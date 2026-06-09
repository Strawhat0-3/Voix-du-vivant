import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import SkipLink from "@/components/SkipLink";
import AdminGuard from "@/components/AdminGuard";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import PersistentAudioPlayer from "@/components/PersistentAudioPlayer";
import MagneticCanvasBackground from "@/components/MagneticCanvasBackground";
import NoiseOverlay from "@/components/NoiseOverlay";
import CustomCursor from "@/components/CustomCursor";

// Eager load critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load less critical pages for better initial load performance
const Admin = lazy(() => import("./pages/Admin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminArticles = lazy(() => import("./pages/AdminArticles"));
const AdminPodcasts = lazy(() => import("./pages/AdminPodcasts"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminModeration = lazy(() => import("./pages/AdminModeration"));
const AdminComments = lazy(() => import("./pages/AdminComments"));
const Profile = lazy(() => import("./pages/Profile"));
const Articles = lazy(() => import("./pages/Articles"));
const Podcasts = lazy(() => import("./pages/Podcasts"));
const ArticleView = lazy(() => import("./components/ArticleView").then(m => ({ default: m.ArticleView })));
const PodcastView = lazy(() => import("./components/PodcastView").then(m => ({ default: m.PodcastView })));

// Configure QueryClient with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (previously cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div 
    className="min-h-screen flex items-center justify-center"
    role="status"
    aria-label="Chargement de la page"
  >
    <div className="flex flex-col items-center gap-4">
      <div 
        className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"
        aria-hidden="true"
      />
      <span className="text-muted-foreground sr-only">Chargement...</span>
    </div>
  </div>
);

// Toutes les routes publiques + zone admin protégée
const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/articles" element={<Articles />} />
      <Route path="/podcasts" element={<Podcasts />} />
      <Route path="/article/:slug" element={<ArticleView />} />
      <Route path="/podcast/:slug" element={<PodcastView />} />
      <Route path="/profile" element={<Profile />} />
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <Admin />
          </AdminGuard>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="articles" element={<AdminArticles />} />
        <Route path="podcasts" element={<AdminPodcasts />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="moderation" element={<AdminModeration />} />
        <Route path="comments" element={<AdminComments />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            {/* ── Global ambient layers (outside routes — never remount) ── */}
            <MagneticCanvasBackground />
            <NoiseOverlay />
            <CustomCursor />

            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AudioPlayerProvider>
                <SkipLink />
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/*" element={<AppRoutes />} />
                </Routes>
                <PersistentAudioPlayer />
              </AudioPlayerProvider>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
