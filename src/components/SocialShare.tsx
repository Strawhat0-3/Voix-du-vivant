import { Facebook, Linkedin, Link2, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

// X (Twitter) icon
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  variant?: 'buttons' | 'dropdown';
  size?: 'sm' | 'default' | 'lg';
}

export const SocialShare = ({
  url,
  title,
  description = '',
  variant = 'buttons',
  size = 'default',
}: SocialShareProps) => {
  const { toast } = useToast();
  const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast({
        title: "Lien copié !",
        description: "Le lien a été copié dans le presse-papiers.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien.",
        variant: "destructive",
      });
    }
  };

  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
  const buttonSize = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';

  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className={buttonSize}>
            <Link2 className={iconSize} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleShare('facebook')}>
            <Facebook className="mr-2 h-4 w-4 text-[#1877F2]" />
            Facebook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare('twitter')}>
            <XIcon className="mr-2 h-4 w-4" />
            X (Twitter)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare('linkedin')}>
            <Linkedin className="mr-2 h-4 w-4 text-[#0A66C2]" />
            LinkedIn
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
            <MessageCircle className="mr-2 h-4 w-4 text-[#25D366]" />
            WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare('email')}>
            <Mail className="mr-2 h-4 w-4" />
            Email
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyLink}>
            <Link2 className="mr-2 h-4 w-4" />
            Copier le lien
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className={`${buttonSize} hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-colors`}
        onClick={() => handleShare('facebook')}
        title="Partager sur Facebook"
      >
        <Facebook className={iconSize} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className={`${buttonSize} hover:bg-foreground hover:text-background hover:border-foreground transition-colors`}
        onClick={() => handleShare('twitter')}
        title="Partager sur X"
      >
        <XIcon className={iconSize} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className={`${buttonSize} hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-colors`}
        onClick={() => handleShare('linkedin')}
        title="Partager sur LinkedIn"
      >
        <Linkedin className={iconSize} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className={`${buttonSize} hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-colors`}
        onClick={() => handleShare('whatsapp')}
        title="Partager sur WhatsApp"
      >
        <MessageCircle className={iconSize} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className={buttonSize}
        onClick={handleCopyLink}
        title="Copier le lien"
      >
        <Link2 className={iconSize} />
      </Button>
    </div>
  );
};
