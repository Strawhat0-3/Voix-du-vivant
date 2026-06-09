import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface RubriqueCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: "primary" | "secondary" | "accent";
  href?: string;
}

const RubriqueCard = ({
  icon: Icon,
  title,
  description,
  color,
  href,
}: RubriqueCardProps) => {
  const colorClasses = {
    primary: "bg-primary/10 text-primary hover:bg-primary/20",
    secondary: "bg-secondary/10 text-secondary hover:bg-secondary/20",
    accent: "bg-accent/10 text-accent hover:bg-accent/20",
  };

  const content = (
    <Card className="group overflow-hidden border-0 shadow-natural hover:shadow-elevated transition-slow cursor-pointer h-full">
      <CardContent className="p-6 space-y-4">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center transition-smooth ${colorClasses[color]}`}
        >
          <Icon className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-serif font-semibold group-hover:text-primary transition-smooth">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
};

export default RubriqueCard;
