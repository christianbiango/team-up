"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cream-warm via-sunshine-light/20 to-coral-light/30 px-4 text-center">
      <h1 className="text-7xl font-bold text-coral-warm mb-6">404</h1>
      <h2 className="text-2xl font-semibold text-earth-brown mb-4">
        Oups ! Page introuvable
      </h2>
      <p className="text-earth-brown/70 mb-8 max-w-md">
        La page que vous recherchez n’existe pas ou a été déplacée. Retournez à
        l’accueil pour continuer à organiser vos événements.
      </p>
      <Button
        onClick={() => router.push("/")}
        className="bg-forest-fresh hover:bg-forest-fresh/90 text-white"
      >
        Retour à l’accueil
      </Button>
    </div>
  );
}
