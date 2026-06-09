import { cn } from "@/lib/utils";

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Skip link component for keyboard navigation accessibility.
 * Allows users to skip repetitive content and jump to main content.
 * WCAG 2.1 Level A requirement.
 */
const SkipLink = ({ 
  href = "#main-content", 
  children = "Aller au contenu principal",
  className 
}: SkipLinkProps) => {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only",
        "focus:fixed focus:top-4 focus:left-4 focus:z-[100]",
        "focus:px-4 focus:py-2 focus:rounded-md",
        "focus:bg-primary focus:text-primary-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "transition-all duration-200",
        className
      )}
    >
      {children}
    </a>
  );
};

export default SkipLink;
