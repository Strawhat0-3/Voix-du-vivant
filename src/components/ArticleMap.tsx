import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ArticleLocation {
  id: string;
  title: string;
  slug: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  rubrique: string;
}

interface ArticleMapProps {
  mapboxToken: string;
  className?: string;
  height?: string;
}

export const ArticleMap = ({ mapboxToken, className = '', height = '500px' }: ArticleMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [articles, setArticles] = useState<ArticleLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticlesWithCoordinates = async () => {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('id, title, slug, latitude, longitude, image_url, rubrique')
          .eq('published', true)
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (error) throw error;

        setArticles(data?.map(a => ({
          ...a,
          latitude: Number(a.latitude),
          longitude: Number(a.longitude),
        })) || []);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Impossible de charger les articles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticlesWithCoordinates();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || articles.length === 0) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      projection: 'globe',
      zoom: 3,
      center: [20, 0], // Center on Africa
      pitch: 20,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
      });
    });

    // Add markers for each article
    articles.forEach((article) => {
      const el = document.createElement('div');
      el.className = 'article-marker';
      el.style.cssText = `
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, hsl(142, 71%, 45%), hsl(142, 71%, 35%));
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
      `;
      el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="currentColor"/></svg>`;
      
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: 'article-popup',
      }).setHTML(`
        <div style="max-width: 200px;">
          ${article.image_url ? `<img src="${article.image_url}" alt="${article.title}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 8px 8px 0 0;" />` : ''}
          <div style="padding: 12px;">
            <span style="font-size: 11px; color: hsl(142, 71%, 45%); text-transform: uppercase; font-weight: 600;">${article.rubrique}</span>
            <h3 style="font-weight: 600; margin: 4px 0; font-size: 14px; line-height: 1.3;">${article.title}</h3>
            <a href="/article/${article.slug}" style="color: hsl(142, 71%, 45%); font-size: 12px; text-decoration: none;">Lire l'article →</a>
          </div>
        </div>
      `);

      new mapboxgl.Marker(el)
        .setLngLat([article.longitude, article.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });

    // Fit bounds to show all markers
    if (articles.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      articles.forEach((article) => {
        bounds.extend([article.longitude, article.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 6 });
    }

    return () => {
      map.current?.remove();
    };
  }, [articles, mapboxToken]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`} style={{ height }}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`} style={{ height }}>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center bg-muted rounded-lg ${className}`} style={{ height }}>
        <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-center">
          Aucun article géolocalisé disponible pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <div ref={mapContainer} style={{ height }} />
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm">
        <span className="font-medium">{articles.length}</span>
        <span className="text-muted-foreground ml-1">
          article{articles.length > 1 ? 's' : ''} sur la carte
        </span>
      </div>
    </div>
  );
};
