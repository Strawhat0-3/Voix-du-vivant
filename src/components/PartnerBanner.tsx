import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

const PartnerBanner = () => {
  const partners = [
    { name: "Partenaire 1", url: "#" },
    { name: "Partenaire 2", url: "#" },
    { name: "Partenaire 3", url: "#" },
  ];

  return (
    <section className="py-12 bg-muted/20 border-y border-border">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-8">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Nos partenaires
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {partners.map((partner, index) => (
            <a
              key={index}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="p-6 h-24 flex items-center justify-center bg-background hover:shadow-elevated transition-smooth">
                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-smooth">
                  <span className="font-semibold">{partner.name}</span>
                  <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-smooth" />
                </div>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnerBanner;
