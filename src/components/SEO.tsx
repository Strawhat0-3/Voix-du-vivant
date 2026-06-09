import { memo, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  keywords?: string[];
  noindex?: boolean;
}

/**
 * SEO component for managing document head with meta tags.
 * Implements Open Graph, Twitter Cards, and structured data for better SEO.
 * Follows international standards for metadata.
 */
export const SEO = memo(({
  title,
  description = "Voix du Vivant Afrique - Média en ligne dédié à la biodiversité africaine",
  image = "/og-image.jpg",
  url,
  type = 'website',
  author,
  publishedTime,
  keywords = ["biodiversité", "afrique", "environnement", "nature", "conservation", "écologie"],
  noindex = false,
}: SEOProps) => {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  const { fullUrl, fullImage, robotsContent, structuredData } = useMemo(() => {
    const fUrl = url ? `${siteUrl}${url}` : siteUrl;
    const fImage = image.startsWith('http') ? image : `${siteUrl}${image}`;
    const robots = noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large';
    
    // Generate structured data based on content type
    const data = type === 'article' ? {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": description,
      "image": fImage,
      "datePublished": publishedTime,
      "author": author ? {
        "@type": "Person",
        "name": author
      } : undefined,
      "publisher": {
        "@type": "Organization",
        "name": "Voix du Vivant Afrique",
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/logo.jpg`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": fUrl
      }
    } : {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": title,
      "description": description,
      "url": fUrl,
      "publisher": {
        "@type": "Organization",
        "name": "Voix du Vivant Afrique"
      }
    };
    
    return {
      fullUrl: fUrl,
      fullImage: fImage,
      robotsContent: robots,
      structuredData: data
    };
  }, [siteUrl, url, image, title, description, type, author, publishedTime, noindex]);

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <html lang="fr" />
      <title>{title} | Voix du Vivant Afrique</title>
      <meta name="title" content={`${title} | Voix du Vivant Afrique`} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="Voix du Vivant Afrique" />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={title} />

      {/* Article specific meta tags */}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && (
        <meta property="article:section" content="Biodiversité" />
      )}

      {/* SEO & Crawling */}
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
});

SEO.displayName = "SEO";
