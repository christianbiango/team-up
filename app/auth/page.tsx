"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Heart, Users } from "lucide-react";
import teamupLogo from "@/public/assets/teamup-logo.png";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const username = formData.get("username") as string;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      if (data.user) {
        // Create profile after successful signup
        const { error: profileError } = await supabase.from("profiles").insert({
          user_id: data.user.id,
          full_name: fullName,
          username: username,
        });

        if (profileError) throw profileError;

        toast.success(
          "Compte créé avec succès ! Bienvenue dans la famille TeamUp!"
        );
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Erreur lors de l'inscription");
      } else {
        toast.error("Erreur lors de l'inscription");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    console.log("Signing in with:", { email, password });

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log("Sign-in result:", { error });
      if (error) throw error;

      toast.success("Connexion réussie ! Prêt pour l'aventure ?");
      router.push("/dashboard");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Erreur de connexion");
      } else {
        toast.error("Erreur de connexion");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-warm via-sunshine-light/20 to-coral-light/30 flex items-center justify-center p-4">
      {/* Éléments décoratifs */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-sunshine-yellow to-coral-warm rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-br from-meadow-green to-sunshine-yellow rounded-full opacity-15 animate-bounce"></div>

      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-warm border-0 rounded-3xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Image src={teamupLogo} alt="TeamUp!" className="h-16 w-auto" />
              <Heart className="absolute -top-2 -right-2 h-6 w-6 text-coral-warm animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-earth-brown">
            Rejoignez TeamUp!
          </CardTitle>
          <CardDescription className="text-earth-brown/70 font-medium">
            Connectez-vous avec votre communauté sportive
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-cream-warm/50">
              <TabsTrigger
                value="signin"
                className="data-[state=active]:bg-white data-[state=active]:text-earth-brown"
              >
                Connexion
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-white data-[state=active]:text-earth-brown"
              >
                Inscription
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    required
                    className="border-coral-warm/20 focus:border-coral-warm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Mot de passe</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    required
                    className="border-coral-warm/20 focus:border-coral-warm"
                  />
                </div>
                <Button
                  type="submit"
                  variant="village"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Connexion..." : "Se connecter"}
                  <Users className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nom complet</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="Jean Dupont"
                      required
                      className="border-coral-warm/20 focus:border-coral-warm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Pseudo</Label>
                    <Input
                      id="username"
                      name="username"
                      placeholder="jeandupont"
                      required
                      className="border-coral-warm/20 focus:border-coral-warm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    required
                    className="border-coral-warm/20 focus:border-coral-warm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Mot de passe</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="Au moins 6 caractères"
                    required
                    className="border-coral-warm/20 focus:border-coral-warm"
                  />
                </div>
                <Button
                  type="submit"
                  variant="village"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Création..." : "Créer mon compte"}
                  <Heart className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
