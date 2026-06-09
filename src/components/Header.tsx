import { memo, useState, useCallback } from "react";
import { Search, Menu, X, LogIn, User, LogOut, Settings, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SuperSearch, useSuperSearch } from "./SuperSearch";
import { ThemeToggle } from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.jpg";

const navigationItems = [
  { label: "Accueil", href: "/" },
  { label: "Articles", href: "/articles" },
  { label: "Podcasts", href: "/podcasts" },
] as const;

const Header = memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { open: searchOpen, openSearch, closeSearch } = useSuperSearch();
  const { user, isAdmin, signOut } = useAuth();

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleSignOut = useCallback(() => {
    signOut();
    setMobileMenuOpen(false);
  }, [signOut]);

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80"
      role="banner"
    >
      <div className="container flex h-18 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
          aria-label="Voix du Vivant Afrique - Accueil"
        >
          <img 
            src={logo} 
            alt=""
            aria-hidden="true"
            className="w-11 h-11 rounded-full object-cover shadow-natural transition-shadow duration-300 group-hover:shadow-float ring-2 ring-primary/20" 
            loading="eager"
            decoding="sync"
            width={44}
            height={44}
          />
          <div className="flex items-baseline gap-2">
            <span className="text-xl md:text-2xl font-serif font-bold text-foreground transition-colors duration-300 group-hover:text-primary">
              Voix du Vivant
            </span>
            <span className="text-sm font-semibold text-primary hidden sm:inline tracking-wide">
              Afrique
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10" aria-label="Navigation principale">
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="text-sm font-medium text-foreground/70 link-underline link-underline-highlight transition-colors duration-300 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Super-Search button — desktop shows Cmd+K hint */}
          <Button
            variant="ghost"
            size="sm"
            onClick={openSearch}
            aria-label="Ouvrir la recherche (Cmd+K)"
            className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground px-3"
          >
            <Search className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            <span className="hidden lg:inline text-sm">Rechercher</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded border border-border/50">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </Button>
          {/* Mobile icon-only search button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={openSearch}
            aria-label="Ouvrir la recherche"
            className="sm:hidden"
          >
            <Search className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {user ? (
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-border/60 hover:border-primary/50"
                    aria-label="Menu utilisateur"
                  >
                    <User className="mr-2 h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                    Mon Compte
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-serif">Mon compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                      Mon Profil
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                        Administration
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={signOut} 
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Link 
              to="/auth" 
              className="hidden md:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
            >
              <Button variant="highlight" size="sm" className="shadow-natural hover:shadow-glow">
                <LogIn className="mr-2 h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                Connexion
              </Button>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {/* ── SuperSearch modal — Cmd+K — renders above everything ── */}
      <SuperSearch open={searchOpen} onClose={closeSearch} />

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav 
          id="mobile-menu"
          className="md:hidden border-t border-border/40 bg-background animate-fade-in"
          aria-label="Navigation mobile"
        >
          <div className="container flex flex-col gap-1 px-4 py-4">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="py-3 px-3 text-base font-medium rounded-lg transition-colors duration-300 hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={closeMobileMenu}
              >
                {item.label}
              </Link>
            ))}
            <div className="h-px bg-border my-3" role="separator" />
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className="py-3 px-3 text-base font-medium rounded-lg transition-colors duration-300 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={closeMobileMenu}
                >
                  Mon Profil
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="py-3 px-3 text-base font-medium rounded-lg transition-colors duration-300 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={closeMobileMenu}
                  >
                    Administration
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="py-3 px-3 text-base font-medium text-left rounded-lg text-destructive transition-colors duration-300 hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link 
                to="/auth" 
                className="py-3 px-3 text-base font-medium rounded-lg bg-highlight text-highlight-foreground text-center transition-colors duration-300 hover:bg-highlight/90 shadow-natural focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={closeMobileMenu}
              >
                Connexion
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
});

Header.displayName = "Header";

export default Header;
