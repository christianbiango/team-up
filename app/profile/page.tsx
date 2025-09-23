"use client";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Edit,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Trophy,
  Star,
  User as UserIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  favorite_sports: string[];
  skill_level: string;
  availability_days: string[];
  location: string | null;
  created_at: string;
}

const SKILL_LEVELS = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Avancé",
  expert: "Expert",
};

const DAYS_FR = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
};

const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      setUser(user);

      // Récupérer le profil utilisateur
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Aucun profil trouvé
          router.push("/profile-setup");
          return;
        }
        throw error;
      }

      setProfile(profileData);
    } catch (error: unknown) {
      console.error("Error loading profile:", error);
      toast.error("Impossible de charger le profil.");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-warm via-sunshine-light/20 to-coral-light/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral-warm"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-warm via-sunshine-light/20 to-coral-light/30 flex items-center justify-center">
        <Card className="bg-white/90 backdrop-blur-sm shadow-warm rounded-3xl border-0 p-8 text-center">
          <UserIcon className="h-16 w-16 mx-auto text-earth-brown/30 mb-4" />
          <h2 className="text-2xl font-bold text-earth-brown mb-2">
            Profil introuvable
          </h2>
          <p className="text-earth-brown/70 mb-6">
            Votre profil n&apos;existe pas encore.
          </p>
          <Button
            variant="village"
            onClick={() => router.push("/profile-setup")}
          >
            Créer mon profil
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-warm via-sunshine-light/20 to-coral-light/30 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="village-outline"
            onClick={() => router.push("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Button>
          <Button
            variant="village"
            onClick={() => router.push("/profile/edit")}
            className="gap-2 mr-4"
          >
            <Edit className="h-4 w-4" />
            Modifier le profil
          </Button>
          <Button
            variant="village-outline"
            onClick={() => router.push("/stats")}
            className="gap-2"
          >
            <Trophy className="h-4 w-4" />
            Mes statistiques
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profil principal */}
          <Card className="md:col-span-1 bg-white/90 backdrop-blur-sm shadow-warm rounded-3xl border-0">
            <CardContent className="p-8 text-center">
              <Avatar className="w-32 h-32 mx-auto mb-6">
                <AvatarImage
                  src={profile.avatar_url || ""}
                  alt={profile.full_name}
                />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-coral-warm to-sunshine-yellow text-white">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>

              <h1 className="text-3xl font-bold text-earth-brown mb-2">
                {profile.full_name}
              </h1>
              <p className="text-lg text-earth-brown/70 mb-4">
                @{profile.username}
              </p>

              {profile.bio && (
                <p className="text-earth-brown/80 leading-relaxed mb-6">
                  {profile.bio}
                </p>
              )}

              <div className="flex items-center justify-center gap-2 mb-4">
                <Star className="h-5 w-5 text-sunshine-yellow" />
                <span className="text-earth-brown font-medium capitalize">
                  Niveau{" "}
                  {
                    SKILL_LEVELS[
                      profile.skill_level as keyof typeof SKILL_LEVELS
                    ]
                  }
                </span>
              </div>

              <div className="text-sm text-earth-brown/60">
                Membre depuis{" "}
                {new Date(profile.created_at).toLocaleDateString("fr-FR", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </CardContent>
          </Card>

          {/* Informations détaillées */}
          <div className="md:col-span-2 space-y-6">
            {/* Contact */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-warm rounded-3xl border-0">
              <CardHeader>
                <CardTitle className="text-earth-brown flex items-center gap-2">
                  <Mail className="h-5 w-5 text-coral-warm" />
                  Informations de contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-earth-brown/50" />
                  <span className="text-earth-brown">{user?.email}</span>
                </div>

                {profile.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-earth-brown/50" />
                    <span className="text-earth-brown">{profile.phone}</span>
                  </div>
                )}

                {profile.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-earth-brown/50" />
                    <span className="text-earth-brown">{profile.location}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sports préférés */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-warm rounded-3xl border-0">
              <CardHeader>
                <CardTitle className="text-earth-brown flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-coral-warm" />
                  Sports préférés
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.favorite_sports.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.favorite_sports.map((sport) => (
                      <Badge
                        key={sport}
                        variant="secondary"
                        className="bg-coral-warm/10 text-coral-warm font-medium px-3 py-1"
                      >
                        {sport}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-earth-brown/60 italic">
                    Aucun sport préféré renseigné
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Disponibilités */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-warm rounded-3xl border-0">
              <CardHeader>
                <CardTitle className="text-earth-brown flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-coral-warm" />
                  Disponibilités
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.availability_days.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.availability_days.map((day) => (
                      <Badge
                        key={day}
                        variant="outline"
                        className="border-meadow-green text-meadow-green font-medium px-3 py-1"
                      >
                        {DAYS_FR[day as keyof typeof DAYS_FR] || day}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-earth-brown/60 italic">
                    Disponibilités non renseignées
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
