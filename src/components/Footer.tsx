import { memo } from "react";
import { Facebook, Instagram, Mail, Leaf } from "lucide-react";
import { NewsletterForm } from "./NewsletterForm";
import { Link } from "react-router-dom";

// Custom icons for platforms not in lucide
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const footerLinks = {
  Explorer: [
    { label: "Espèces à la loupe", href: "/articles?rubrique=especes" },
    { label: "Comprendre l'environnement", href: "/articles?rubrique=environnement" },
    { label: "Acteurs du vivant", href: "/articles?rubrique=acteurs" },
    { label: "Podcasts", href: "/podcasts" },
  ],
  Découvrir: [
    { label: "Traditions & Nature", href: "/articles?rubrique=traditions" },
    { label: "Initiatives locales", href: "/articles?rubrique=initiatives" },
    { label: "Jeunesse & Pédagogie", href: "/articles?rubrique=jeunesse" },
    { label: "Ressources", href: "/articles?rubrique=ressources" },
  ],
  "À propos": [
    { label: "Notre mission", href: "/" },
    { label: "L'équipe", href: "/" },
    { label: "Contact", href: "/" },
    { label: "Proposer un sujet", href: "/" },
  ],
} as const;

const socialLinks = [
  { icon: Facebook, href: "https://www.facebook.com/share/1832tEUGno/?mibextid=wwXIfr", label: "Facebook" },
  { icon: Instagram, href: "https://www.instagram.com/voixduvivantafrique?igsh=MTU3azhmc2NqbWtjMg%3D%3D&utm_source=qr", label: "Instagram" },
  { icon: TikTokIcon, href: "https://www.tiktok.com/@voix.du.vivant.af?_r=1&_t=ZS-93TXwGa1T1U", label: "TikTok", isCustom: true },
  { icon: YouTubeIcon, href: "https://youtube.com/@voixduvivantafrique?si=YWm1L4mTsX1AhxXp", label: "YouTube", isCustom: true },
  { icon: LinkedInIcon, href: "https://www.linkedin.com/in/voix-du-vivant-afrique-b862323a9/", label: "LinkedIn", isCustom: true },
  { icon: Mail, href: "mailto:contact@voixduvivant.africa", label: "Email" },
] as const;

const Footer = memo(() => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="bg-primary text-primary-foreground relative overflow-hidden"
      role="contentinfo"
      aria-label="Pied de page"
    >
      {/* Texture de fond */}
      <div className="absolute inset-0 bg-grain opacity-50" aria-hidden="true" />
      
      {/* Motif décoratif */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-highlight/10 to-transparent rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-3xl" aria-hidden="true" />

      <div className="container relative z-10 px-4 md:px-6 py-16 md:py-20">
        {/* Newsletter Section */}
        <div className="max-w-2xl mx-auto text-center mb-16 pb-16 border-b border-primary-foreground/15">
          <NewsletterForm 
            variant="default" 
            title="Restez connecté au vivant"
            subtitle="Recevez nos derniers articles et podcasts directement dans votre boîte mail"
            className="[&_h3]:text-3xl [&_h3]:md:text-4xl [&_h3]:font-serif [&_h3]:text-primary-foreground [&_p]:text-primary-foreground/75 [&_input]:bg-primary-foreground/10 [&_input]:border-primary-foreground/20 [&_input]:text-primary-foreground [&_input]:placeholder:text-primary-foreground/50 [&_button]:bg-highlight [&_button]:hover:bg-highlight/90 [&_button]:text-highlight-foreground [&_button]:shadow-glow" 
          />
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-16">
          {/* Logo Column */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="bg-highlight/20 p-2 rounded-full" aria-hidden="true">
                <Leaf className="h-6 w-6 text-highlight" strokeWidth={1.5} />
              </div>
              <span className="text-2xl font-serif font-bold">
                Voix du Vivant
              </span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-xs">
              Découvrir, comprendre et protéger la biodiversité africaine à travers des récits inspirants et des voix engagées.
            </p>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <nav key={category} aria-label={`Navigation ${category}`}>
              <h3 className="font-serif font-semibold mb-5 text-primary-foreground text-lg">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-primary-foreground/65 hover:text-highlight transition-colors duration-300 inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-primary rounded-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-foreground/15 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-primary-foreground/50">
            © {currentYear} Voix du Vivant Afrique. Tous droits réservés.
          </p>
          <nav aria-label="Réseaux sociaux">
            <ul className="flex items-center gap-1">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                const isCustom = 'isCustom' in social && social.isCustom;
                return (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      aria-label={social.label}
                      className="text-primary-foreground/50 hover:text-highlight transition-colors duration-200 p-2.5 rounded-full hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight inline-flex"
                      target={social.href.startsWith("mailto:") ? undefined : "_blank"}
                      rel={social.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                    >
                      {isCustom ? (
                        <Icon className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
