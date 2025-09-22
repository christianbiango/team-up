"use client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  LogOut,
  User as UserIcon,
  Trophy,
  Clock,
  Star,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import teamupLogo from "@/public/assets/teamup-logo.png";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface Profile {
  id: string;
  username: string;
  full_name: string;
  bio: string | null;
  favorite_sports: string[];
  skill_level: string;
  location: string | null;
}

interface Event {
  id: string;
  title: string;
  sport_type: string;
  date_time: string;
  max_participants: number;
  current_participants: number;
  venue_address: string | null;
  organizer_id: string;
  status: string;
  profiles: {
    username: string;
    full_name: string;
  };
}

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
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

      setCurrentUser(user);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError;
      }

      if (!profileData) {
        // No profile found, redirect to profile setup
        router.push("/profile-setup");
        return;
      }

      setProfile(profileData);

      // Fetch upcoming events
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select(
          `
          *,
          profiles!events_organizer_id_fkey (
            username,
            full_name
          )
        `
        )
        .gte("date_time", new Date().toISOString())
        .eq("status", "open")
        .order("date_time", { ascending: true })
        .limit(6);

      if (eventsError) throw eventsError;

      setUpcomingEvents(eventsData || []);
    } catch (error: unknown) {
      console.error("Error:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
      toast.success("Déconnexion réussie. À bientôt !");
    } catch {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-warm via-sunshine-light/20 to-coral-light/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral-warm"></div>
      </div>
    );
  }
  console.log("profile fav sport", profile);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-warm via-sunshine-light/20 to-coral-light/30">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-warm border-b border-coral-warm/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image src={teamupLogo} alt="TeamUp!" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-earth-brown">
                  Salut {profile?.full_name?.split(" ")[0]} ! 👋
                </h1>
                <p className="text-sm text-earth-brown/70">
                  Prêt pour de nouvelles aventures sportives ?
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="village-outline"
                size="sm"
                onClick={() => router.push("/stats")}
                className="mr-2"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Stats
              </Button>
              <Button
                variant="village-outline"
                size="sm"
                onClick={() => router.push("/profile")}
              >
                <UserIcon className="h-4 w-4 mr-2" />
                Profil
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card
            className="bg-gradient-to-br from-coral-warm to-sunshine-yellow text-white shadow-warm rounded-3xl border-0 cursor-pointer hover:scale-105 transition-all duration-300"
            onClick={() => router.push("/create-event")}
          >
            <CardContent className="p-6 text-center">
              <Plus className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Créer un événement</h3>
              <p className="opacity-90">
                Organisez votre prochaine rencontre sportive
              </p>
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-br from-meadow-green to-sunshine-yellow text-white shadow-warm rounded-3xl border-0 cursor-pointer hover:scale-105 transition-all duration-300"
            onClick={() => router.push("/events")}
          >
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">
                Parcourir les événements
              </h3>
              <p className="opacity-90">
                Trouvez des activités près de chez vous
              </p>
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-br from-sunshine-yellow to-terracotta text-white shadow-warm rounded-3xl border-0 cursor-pointer hover:scale-105 transition-all duration-300"
            onClick={() => router.push("/stats")}
          >
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Mes statistiques</h3>
              <p className="opacity-90">Suivez vos performances et progrès</p>
            </CardContent>
          </Card>
        </div>

        {/* User Stats */}
        {profile && (
          <Card className="bg-white/90 backdrop-blur-sm shadow-warm rounded-3xl border-0 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-earth-brown">
                <Trophy className="h-6 w-6 text-sunshine-yellow" />
                Votre profil sportif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-coral-warm">
                    {profile.favorite_sports.length}
                  </div>
                  <div className="text-sm text-earth-brown/70">
                    Sports préférés
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-meadow-green">
                    <Star className="h-6 w-6 mx-auto" />
                  </div>
                  <div className="text-sm text-earth-brown/70 capitalize">
                    Niveau {profile.skill_level}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-sunshine-yellow">
                    {upcomingEvents.length}
                  </div>
                  <div className="text-sm text-earth-brown/70">
                    Événements à venir
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-terracotta">
                    <MapPin className="h-6 w-6 mx-auto" />
                  </div>
                  <div className="text-sm text-earth-brown/70">
                    {profile.location || "Aucune localisation"}
                  </div>
                </div>
              </div>

              {profile.favorite_sports.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {profile.favorite_sports.map((sport) => (
                      <Badge
                        key={sport}
                        variant="secondary"
                        className="bg-coral-warm/10 text-coral-warm"
                      >
                        {sport}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Événements à venir */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-warm rounded-3xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-earth-brown">
              <Calendar className="h-6 w-6 text-coral-warm" />
              Événements à découvrir
            </CardTitle>
            <CardDescription>
              Les prochaines rencontres sportives près de chez vous
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 mx-auto text-earth-brown/30 mb-4" />
                <p className="text-earth-brown/70">
                  Aucun événement prévu pour le moment
                </p>
                <Button
                  variant="village"
                  className="mt-4"
                  onClick={() => router.push("/create-event")}
                >
                  Créer le premier événement
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-cream-warm/30"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge
                          variant="secondary"
                          className="bg-coral-warm/10 text-coral-warm"
                        >
                          {event.sport_type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {event.current_participants}/{event.max_participants}
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-earth-brown mb-2 line-clamp-2">
                        {event.title}
                      </h3>

                      <div className="space-y-1 text-sm text-earth-brown/70">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(event.date_time)}
                        </div>
                        {event.venue_address && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1">
                              {event.venue_address}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Par {event.profiles.full_name}
                        </div>
                      </div>

                      <Button
                        variant="village-soft"
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => router.push(`/events/${event.id}`)}
                      >
                        Voir les détails
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
