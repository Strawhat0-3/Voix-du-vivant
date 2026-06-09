import { Heart } from "lucide-react";

const AboutSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Heart className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-foreground">
            À propos de nous
          </h2>
          <div className="space-y-4 text-lg text-muted-foreground leading-relaxed text-center">
            <p>
              <span className="font-semibold text-foreground">Voix du Vivant Afrique</span> est une plateforme dédiée à la 
              découverte, la compréhension et la protection de la biodiversité africaine. Nous croyons que 
              la connaissance est le premier pas vers la préservation de notre patrimoine naturel.
            </p>
            <p>
              À travers nos articles, podcasts et contenus multimédias, nous donnons la parole aux scientifiques, 
              aux communautés locales et aux acteurs de terrain qui œuvrent quotidiennement pour la sauvegarde 
              de nos écosystèmes. Notre mission est de sensibiliser, d'éduquer et d'inspirer l'action en faveur 
              de la nature africaine.
            </p>
            <p>
              Ensemble, faisons entendre la voix du vivant et préservons la richesse de notre continent 
              pour les générations futures.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
