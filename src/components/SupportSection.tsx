import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, CreditCard, ExternalLink } from "lucide-react";

// Configuration des liens de don - modifiez ces URLs selon vos besoins
const DONATION_LINKS = {
  oneTime: "https://paypal.me/votre-lien", // Remplacez par votre lien PayPal, GoFundMe, etc.
  monthly: "https://paypal.me/votre-lien", // Remplacez par votre lien pour dons mensuels
};

const SupportSection = () => {
  const handleDonation = (type: 'oneTime' | 'monthly') => {
    const url = DONATION_LINKS[type];
    if (url && url !== "https://paypal.me/votre-lien") {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      // Si le lien n'est pas configuré, afficher un message
      alert("Lien de don non configuré. Veuillez contacter l'administrateur.");
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-accent/10 to-primary/10">
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 md:p-12 shadow-elevated">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-accent/20 rounded-full">
                  <Heart className="h-10 w-10 text-accent" fill="currentColor" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground">
                Soutenez-nous
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Votre soutien nous permet de continuer à produire du contenu de qualité 
                et à sensibiliser sur la protection de la biodiversité africaine.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6 bg-background/50 border-2 hover:border-accent transition-smooth">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-accent" />
                  Don ponctuel
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Un don unique pour soutenir notre mission
                </p>
                <Button 
                  className="w-full gap-2" 
                  variant="outline"
                  onClick={() => handleDonation('oneTime')}
                >
                  Faire un don
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Card>

              <Card className="p-6 bg-background/50 border-2 hover:border-primary transition-smooth">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Don mensuel
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Devenez membre et soutenez-nous régulièrement
                </p>
                <Button 
                  className="w-full gap-2"
                  onClick={() => handleDonation('monthly')}
                >
                  Devenir membre
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Card>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Paiements sécurisés via PayPal et autres plateformes</p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SupportSection;
