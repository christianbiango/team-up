"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Heart,
  MapPin,
  MessageCircle,
  Shield,
  Sparkles,
  Sun,
  Trophy,
  Users,
} from "lucide-react";
import HomeNavbar from "./navigation/HomeNavbar";

const HeroVillage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-warm via-sunshine-light/20 to-coral-light/30 relative overflow-hidden">
      {/* Éléments décoratifs organiques */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-sunshine-yellow to-coral-warm rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-1/3 right-20 w-32 h-32 bg-gradient-to-br from-meadow-green to-sunshine-yellow rounded-full opacity-15 animate-bounce"></div>
      <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-br from-coral-warm to-terracotta rounded-full opacity-25"></div>

      {/* Header organique */}
      <HomeNavbar />

      {/* Hero Section organique */}
      <section className="container mx-auto px-4 py-12 text-center relative z-10">
        <div className="mx-auto max-w-5xl">
          <div className="relative">
            <Sun
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 h-16 w-16 text-sunshine-yellow animate-spin"
              style={{ animationDuration: "20s" }}
            />
            <h2 className="mb-8 text-6xl font-black text-earth-brown leading-tight transform hover:scale-105 transition-transform duration-500">
              Le sport,
              <span className="block bg-gradient-to-r from-coral-warm via-sunshine-yellow to-meadow-green bg-clip-text text-transparent animate-pulse">
                c&apos;est plus fort ensemble !
              </span>
            </h2>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-warm mb-10 transform hover:rotate-1 transition-all duration-500">
            <p className="text-2xl text-earth-brown font-medium leading-relaxed">
              🏃‍♀️ Créez des liens authentiques avec votre communauté sportive
              locale !
              <br />
              🤝 Partagez des moments uniques et construisez ensemble une vie
              associative riche en émotions.
            </p>
          </div>

          <div className="flex gap-6 justify-center flex-wrap">
            <Button
              variant="village"
              size="lg"
              className="text-xl px-10 py-4 gap-3"
              onClick={() => (window.location.href = "/create-event")}
            >
              <Heart className="h-6 w-6" />
              Créer un événement
            </Button>
            <Button
              variant="village-soft"
              size="lg"
              className="text-xl px-10 py-4 gap-3"
              onClick={() => (window.location.href = "/events")}
            >
              <Users className="h-6 w-6" />
              Découvrir les événements
            </Button>
          </div>
        </div>
      </section>

      {/* Features en cercles organiques */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-earth-brown mb-6 transform hover:scale-105 transition-transform duration-300">
            🌟 Notre boîte à outils magique
          </h3>
          <p className="text-xl text-earth-brown/80 font-medium bg-white/70 rounded-full px-8 py-4 inline-block shadow-soft">
            Six super-pouvoirs pour révolutionner vos aventures sportives !
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <OrganicFeatureCard
            icon={<Users className="h-12 w-12 text-white" />}
            title="Profils Magiques"
            description="Créez votre avatar sportif unique et trouvez vos âmes sœurs du terrain !"
            bgGradient="from-coral-warm to-sunshine-yellow"
            delay="0"
          />
          <OrganicFeatureCard
            icon={<Calendar className="h-12 w-12 text-white" />}
            title="Événements Festifs"
            description="Organisez des rencontres inoubliables en 3 clics magiques !"
            bgGradient="from-sunshine-yellow to-meadow-green"
            delay="100"
          />
          <OrganicFeatureCard
            icon={<MapPin className="h-12 w-12 text-white" />}
            title="Terrains Secrets"
            description="Découvrez les pépites sportives cachées de votre quartier !"
            bgGradient="from-meadow-green to-coral-warm"
            delay="200"
          />
          <OrganicFeatureCard
            icon={<MessageCircle className="h-12 w-12 text-white" />}
            title="Tchat Convivial"
            description="Papotez avec vos équipiers comme au café du coin !"
            bgGradient="from-terracotta to-sunshine-yellow"
            delay="300"
          />
          <OrganicFeatureCard
            icon={<Trophy className="h-12 w-12 text-white" />}
            title="Trophées Rigolos"
            description="Collectionnez des badges plus fun qu'une collection de cartes Pokémon !"
            bgGradient="from-coral-warm to-meadow-green"
            delay="400"
          />
          <OrganicFeatureCard
            icon={<Shield className="h-12 w-12 text-white" />}
            title="Sécurité Zen"
            description="Vos données sont chouchoutées comme un trésor de famille !"
            bgGradient="from-sunshine-yellow to-coral-warm"
            delay="500"
          />
        </div>
      </section>

      {/* CTA finale en forme de festival */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-coral-warm via-sunshine-yellow via-meadow-green to-terracotta rounded-[3rem] transform rotate-1 opacity-20"></div>
          <div className="relative bg-gradient-to-r from-coral-warm via-sunshine-yellow to-meadow-green p-12 rounded-[3rem] text-center text-white shadow-2xl transform hover:scale-105 transition-all duration-500">
            <div className="flex justify-center gap-4 mb-6">
              <Heart className="h-12 w-12 animate-pulse" />
              <Sparkles className="h-12 w-12 animate-bounce" />
              <Sun
                className="h-12 w-12 animate-spin"
                style={{ animationDuration: "3s" }}
              />
            </div>
            <h3 className="text-5xl font-black mb-6">
              🎉 Prêt pour l&apos;aventure ?
            </h3>
            <p className="text-2xl mb-8 opacity-95 font-medium">
              Rejoignez notre joyeuse tribu et transformez chaque match en fête
              de village !
            </p>
            <Button
              variant="outline"
              size="lg"
              className="bg-white text-earth-brown hover:bg-cream-warm border-white text-xl px-12 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
              onClick={() => (window.location.href = "/auth")}
            >
              🚀 C&apos;est parti !
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

const OrganicFeatureCard = ({
  icon,
  title,
  description,
  bgGradient,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgGradient: string;
  delay: string;
}) => {
  return (
    <div className="group" style={{ animationDelay: `${delay}ms` }}>
      <Card className="bg-white/90 backdrop-blur-sm hover:bg-white hover:shadow-nature transition-all duration-500 transform hover:scale-105 hover:-rotate-2 rounded-3xl border-0 overflow-hidden">
        <CardContent className="p-8 text-center">
          <div
            className={`w-20 h-20 bg-gradient-to-r ${bgGradient} rounded-full mx-auto mb-6 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg`}
          >
            {icon}
          </div>
          <h3 className="text-2xl font-bold mb-4 text-earth-brown group-hover:text-coral-warm transition-colors duration-300">
            {title}
          </h3>
          <p className="text-earth-brown/80 font-medium text-lg leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeroVillage;
