import { memo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, BookOpen, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import OptimizedImage from "./OptimizedImage";
import heroImage from "@/assets/hero-savanna.jpg";

const Hero = memo(() => {
  return (
    <section 
      className="relative h-[90vh] min-h-[650px] w-full overflow-hidden"
      aria-label="Section d'introduction"
    >
      {/* Background Image - Priority loading for LCP */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover scale-105"
          loading="eager"
          decoding="sync"
          fetchPriority="high"
        />
        {/* Gradient overlay - Canopée style */}
        <div className="absolute inset-0 gradient-hero" aria-hidden="true" />
        {/* Vignette subtile */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="relative z-10 container h-full flex flex-col justify-center items-start px-6 md:px-8">
        <div className="max-w-4xl space-y-8">
          {/* Overline */}
          <span 
            className="inline-block text-overline text-primary-foreground/70 tracking-[0.2em] opacity-0 animate-fade-in stagger-1"
            aria-hidden="true"
          >
            Biodiversité Africaine
          </span>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-primary-foreground leading-[1.1] opacity-0 animate-fade-in-up stagger-2">
            Voix du Vivant
            <span className="block text-gradient-sunset bg-clip-text">Afrique</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-primary-foreground/85 font-light leading-relaxed max-w-2xl opacity-0 animate-fade-in-up stagger-3">
            Découvrir, Comprendre et Protéger la richesse naturelle du continent africain
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 opacity-0 animate-fade-in-up stagger-4">
            <Link to="/articles">
              <Button
                size="lg"
                variant="highlight"
                className="w-full sm:w-auto group"
              >
                <BookOpen className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={1.5} aria-hidden="true" />
                Explorer les articles
              </Button>
            </Link>
            <Link to="/podcasts">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-primary-foreground/40 text-primary-foreground bg-primary-foreground/5 hover:bg-primary-foreground/15 hover:border-primary-foreground/60 backdrop-blur-sm group"
              >
                <Headphones className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={1.5} aria-hidden="true" />
                Écouter les podcasts
              </Button>
            </Link>
          </div>

          {/* Stats bar */}
          <div 
            className="flex flex-wrap gap-8 pt-8 opacity-0 animate-fade-in stagger-5"
            role="list"
            aria-label="Statistiques du site"
          >
            <div className="text-primary-foreground/80" role="listitem">
              <span className="block text-2xl sm:text-3xl font-serif font-bold text-primary-foreground">150+</span>
              <span className="text-sm text-primary-foreground/60">Articles publiés</span>
            </div>
            <div className="text-primary-foreground/80" role="listitem">
              <span className="block text-2xl sm:text-3xl font-serif font-bold text-primary-foreground">50+</span>
              <span className="text-sm text-primary-foreground/60">Podcasts</span>
            </div>
            <div className="text-primary-foreground/80" role="listitem">
              <span className="block text-2xl sm:text-3xl font-serif font-bold text-primary-foreground">15K</span>
              <span className="text-sm text-primary-foreground/60">Lecteurs mensuels</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float"
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-primary-foreground/50 uppercase tracking-widest">Défiler</span>
          <ArrowDown className="h-6 w-6 text-primary-foreground/50" strokeWidth={1.5} />
        </div>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";

export default Hero;
