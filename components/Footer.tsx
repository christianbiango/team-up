import { Heart, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import teamupLogo from "@/public/assets/teamup-logo.png";
import Link from "next/link";
import Image from "next/image";
import InstallButton from "./InstallButton";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-cream-warm via-sunshine-light/30 to-coral-light/20 border-t border-coral-warm/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image src={teamupLogo} alt="TeamUp!" className="h-12 w-auto" />
              <div>
                <h3 className="text-xl font-bold text-earth-brown">TeamUp!</h3>
                <p className="text-sm text-earth-brown/70">
                  Sport & Convivialité
                </p>
              </div>
            </div>
            <p className="text-earth-brown/80 font-medium leading-relaxed mb-6 max-w-md">
              La plateforme qui connecte les passionnés de sport pour organiser,
              participer et exceller ensemble dans leurs activités sportives
              locales.
            </p>
            <div className="flex flex-col items-start sm:flex-row gap-4">
              <Button variant="village" size="sm" className="gap-2">
                <Heart className="h-4 w-4" />
                Rejoignez-nous
              </Button>
              <InstallButton />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold text-earth-brown mb-4">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-earth-brown/70 hover:text-coral-warm transition-colors"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-earth-brown/70 hover:text-coral-warm transition-colors"
                >
                  Événements
                </Link>
              </li>
              <li>
                <a
                  href="/dashboard"
                  className="text-earth-brown/70 hover:text-coral-warm transition-colors"
                >
                  Tableau de bord
                </a>
              </li>
              <li>
                <a
                  href="/auth"
                  className="text-earth-brown/70 hover:text-coral-warm transition-colors"
                >
                  Connexion
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold text-earth-brown mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-earth-brown/70">
                <Mail className="h-4 w-4 text-coral-warm" />
                <span className="text-sm">contact@teamup.sport</span>
              </li>
              <li className="flex items-center gap-2 text-earth-brown/70">
                <Phone className="h-4 w-4 text-coral-warm" />
                <span className="text-sm">+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center gap-2 text-earth-brown/70">
                <MapPin className="h-4 w-4 text-coral-warm" />
                <span className="text-sm">Paris, France</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-coral-warm/20 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-earth-brown/60 text-sm">
              © 2024 TeamUp! - Tous droits réservés
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                href="/mentions-legales"
                className="text-earth-brown/60 hover:text-coral-warm transition-colors"
              >
                Mentions légales
              </Link>
              <Link
                href="/politique-de-confidentialite"
                className="text-earth-brown/60 hover:text-coral-warm transition-colors"
              >
                Politique de confidentialité
              </Link>
              <Link
                href="/cgu"
                className="text-earth-brown/60 hover:text-coral-warm transition-colors"
              >
                CGU
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
