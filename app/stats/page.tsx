"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  Calendar,
  Users,
  Target,
  Award,
  BarChart3,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface UserStats {
  eventsCreated: number;
  eventsParticipated: number;
  totalParticipants: number;
  favoritesSports: { sport: string; count: number }[];
  monthlyActivity: { month: string; events: number }[];
  upcomingEvents: number;
  completedEvents: number;
  achievements: string[];
}

interface Profile {
  full_name: string;
  username: string;
  skill_level: string;
  favorite_sports: string[];
  created_at: string;
}

const ACHIEVEMENTS = [
  {
    id: "first_event",
    name: "Premier pas",
    description: "Créer votre premier événement",
    icon: "🚀",
  },
  {
    id: "social_butterfly",
    name: "Papillon social",
    description: "Participer à 5 événements",
    icon: "🦋",
  },
  {
    id: "organizer",
    name: "Organisateur",
    description: "Créer 3 événements",
    icon: "📋",
  },
  {
    id: "regular",
    name: "Régulier",
    description: "Participer à 10 événements",
    icon: "⭐",
  },
  {
    id: "super_organizer",
    name: "Super organisateur",
    description: "Créer 10 événements",
    icon: "🏆",
  },
  {
    id: "community_builder",
    name: "Bâtisseur de communauté",
    description: "Organiser des événements avec 100+ participants au total",
    icon: "🌟",
  },
];

type EventParticipant = {
  id: string;
  participant_id: string;
  event_id: string;
  // add other participant fields as needed
};

type Event = {
  id: string;
  sport_type: string;
  created_at: string;
  date_time: string;
  event_participants?: EventParticipant[];
  // add other event fields as needed
};

type Participation = {
  events: Event[];
};

const Stats = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      // Charger le profil
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Charger les statistiques
      const statsData = await calculateUserStats(user.id);
      setStats(statsData);
    } catch (error: unknown) {
      console.error("Error loading stats:", error);
      toast.error("Erreur : Impossible de charger les statistiques.");
    } finally {
      setLoading(false);
    }
  };

  const calculateUserStats = async (userId: string): Promise<UserStats> => {
    // Événements créés
    const { data: createdEvents } = await supabase
      .from("events")
      .select("*, event_participants(*)")
      .eq("organizer_id", userId);

    // Événements auxquels l'utilisateur participe
    const { data: participations } = await supabase
      .from("event_participants")
      .select("events(*)")
      .eq("participant_id", userId);

    // Calculer les métriques
    const eventsCreated = createdEvents?.length || 0;
    const eventsParticipated = participations?.length || 0;

    const totalParticipants =
      createdEvents?.reduce((total, event) => {
        return total + (event.event_participants?.length || 0);
      }, 0) || 0;

    // Sports favoris basés sur la participation
    const sportsCount: Record<string, number> = {};
    participations?.forEach((p: Participation) => {
      if (Array.isArray(p.events)) {
        p.events.forEach((event) => {
          if (event && event.sport_type) {
            sportsCount[event.sport_type] =
              (sportsCount[event.sport_type] || 0) + 1;
          }
        });
      }
    });
    createdEvents?.forEach((event: Event) => {
      if (event.sport_type) {
        sportsCount[event.sport_type] =
          (sportsCount[event.sport_type] || 0) + 1;
      }
    });

    const favoritesSports = Object.entries(sportsCount)
      .map(([sport, count]) => ({ sport, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Activité mensuelle (derniers 6 mois)
    const monthlyActivity: { month: string; events: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString("fr-FR", { month: "short" });

      const eventsThisMonth = [
        ...(createdEvents?.filter(
          (e: Event) =>
            new Date(e.created_at).getMonth() === date.getMonth() &&
            new Date(e.created_at).getFullYear() === date.getFullYear()
        ) || []),
        ...(participations?.flatMap((p: Participation) =>
          Array.isArray(p.events)
            ? p.events.filter(
                (event) =>
                  new Date(event.created_at).getMonth() === date.getMonth() &&
                  new Date(event.created_at).getFullYear() ===
                    date.getFullYear()
              )
            : []
        ) || []),
      ];

      monthlyActivity.push({
        month: monthName,
        events: eventsThisMonth.length,
      });
    }

    // Événements à venir vs complétés
    const now_iso = new Date().toISOString();
    const upcomingEvents = [
      ...(createdEvents?.filter((e: Event) => e.date_time > now_iso) || []),
      ...(participations?.flatMap((p: Participation) =>
        Array.isArray(p.events)
          ? p.events.filter((event) => event.date_time > now_iso)
          : []
      ) || []),
    ].length;

    const completedEvents = eventsCreated + eventsParticipated - upcomingEvents;

    // Calculer les achievements
    const achievements: string[] = [];
    if (eventsCreated >= 1) achievements.push("first_event");
    if (eventsParticipated >= 5) achievements.push("social_butterfly");
    if (eventsCreated >= 3) achievements.push("organizer");
    if (eventsParticipated >= 10) achievements.push("regular");
    if (eventsCreated >= 10) achievements.push("super_organizer");
    if (totalParticipants >= 100) achievements.push("community_builder");

    return {
      eventsCreated,
      eventsParticipated,
      totalParticipants,
      favoritesSports,
      monthlyActivity,
      upcomingEvents,
      completedEvents,
      achievements,
    };
  };

  const getSkillLevelLabel = (level: string) => {
    const levels = {
      beginner: "Débutant",
      intermediate: "Intermédiaire",
      advanced: "Avancé",
      expert: "Expert",
    };
    return levels[level as keyof typeof levels] || level;
  };

  const getActivityLevel = () => {
    if (!stats) return { level: "Nouveau", progress: 0, color: "bg-gray-400" };

    const totalActivity = stats.eventsCreated + stats.eventsParticipated;

    if (totalActivity >= 50)
      return {
        level: "Légende",
        progress: 100,
        color: "bg-gradient-to-r from-purple-500 to-pink-500",
      };
    if (totalActivity >= 25)
      return {
        level: "Expert",
        progress: 80,
        color: "bg-gradient-to-r from-orange-500 to-red-500",
      };
    if (totalActivity >= 15)
      return {
        level: "Avancé",
        progress: 60,
        color: "bg-gradient-to-r from-yellow-500 to-orange-500",
      };
    if (totalActivity >= 8)
      return {
        level: "Intermédiaire",
        progress: 40,
        color: "bg-gradient-to-r from-green-500 to-yellow-500",
      };
    if (totalActivity >= 3)
      return {
        level: "Débutant",
        progress: 20,
        color: "bg-gradient-to-r from-blue-500 to-green-500",
      };

    return { level: "Nouveau", progress: 5, color: "bg-coral-warm" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-warm via-sunshine-light/20 to-coral-light/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral-warm"></div>
      </div>
    );
  }

  const activityLevel = getActivityLevel();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-warm via-sunshine-light/20 to-coral-light/30 p-4">
      <div className="container mx-auto max-w-6xl">
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
          <h1 className="text-4xl font-bold text-earth-brown">
            Mes Statistiques
          </h1>
          <div className="w-32" /> {/* Spacer pour centrer le titre */}
        </div>

        {/* Niveau d'activité */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-warm rounded-3xl border-0 mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-earth-brown mb-2">
                  Niveau d&apos;activité : {activityLevel.level}
                </h2>
                <p className="text-earth-brown/70">
                  Continuez à participer pour débloquer de nouveaux niveaux !
                </p>
              </div>
              <div className="text-6xl">
                {activityLevel.level === "Légende"
                  ? "👑"
                  : activityLevel.level === "Expert"
                  ? "🏆"
                  : activityLevel.level === "Avancé"
                  ? "⭐"
                  : activityLevel.level === "Intermédiaire"
                  ? "🌟"
                  : activityLevel.level === "Débutant"
                  ? "🚀"
                  : "🌱"}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-earth-brown/70">
                <span>Progression</span>
                <span>{activityLevel.progress}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${activityLevel.color} transition-all duration-1000`}
                  style={{ width: `${activityLevel.progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-coral-warm to-sunshine-yellow text-white shadow-warm rounded-3xl border-0">
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4" />
              <div className="text-3xl font-bold mb-2">
                {stats?.eventsCreated || 0}
              </div>
              <div className="text-sm opacity-90">Événements créés</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-meadow-green to-sunshine-yellow text-white shadow-warm rounded-3xl border-0">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <div className="text-3xl font-bold mb-2">
                {stats?.eventsParticipated || 0}
              </div>
              <div className="text-sm opacity-90">Participations</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-sunshine-yellow to-terracotta text-white shadow-warm rounded-3xl border-0">
            <CardContent className="p-6 text-center">
              <Target className="h-12 w-12 mx-auto mb-4" />
              <div className="text-3xl font-bold mb-2">
                {stats?.totalParticipants || 0}
              </div>
              <div className="text-sm opacity-90">Participants attirés</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-terracotta to-coral-warm text-white shadow-warm rounded-3xl border-0">
            <CardContent className="p-6 text-center">
              <Trophy className="h-12 w-12 mx-auto mb-4" />
              <div className="text-3xl font-bold mb-2">
                {stats?.achievements.length || 0}
              </div>
              <div className="text-sm opacity-90">Succès débloqués</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sports favoris */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-warm rounded-3xl border-0">
            <CardHeader>
              <CardTitle className="text-earth-brown flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-coral-warm" />
                Sports les plus pratiqués
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.favoritesSports.length ? (
                <div className="space-y-4">
                  {stats.favoritesSports.map((sport, index) => (
                    <div
                      key={sport.sport}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {index === 0
                            ? "🥇"
                            : index === 1
                            ? "🥈"
                            : index === 2
                            ? "🥉"
                            : "🏅"}
                        </span>
                        <span className="font-medium text-earth-brown">
                          {sport.sport}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-earth-brown/70">
                          {sport.count} événements
                        </div>
                        <Progress
                          value={
                            (sport.count /
                              (stats.favoritesSports[0]?.count || 1)) *
                            100
                          }
                          className="w-20 h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-earth-brown/60 italic text-center py-8">
                  Participez à des événements pour voir vos sports favoris !
                </p>
              )}
            </CardContent>
          </Card>

          {/* Activité mensuelle */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-warm rounded-3xl border-0">
            <CardHeader>
              <CardTitle className="text-earth-brown flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-coral-warm" />
                Activité des 6 derniers mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.monthlyActivity.map((month) => (
                  <div
                    key={month.month}
                    className="flex items-center justify-between"
                  >
                    <span className="font-medium text-earth-brown capitalize">
                      {month.month}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-earth-brown/70">
                        {month.events} événements
                      </span>
                      <Progress
                        value={
                          month.events > 0
                            ? Math.max(
                                (month.events /
                                  Math.max(
                                    ...stats.monthlyActivity.map(
                                      (m) => m.events
                                    )
                                  )) *
                                  100,
                                10
                              )
                            : 0
                        }
                        className="w-20 h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Succès débloqués */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-warm rounded-3xl border-0 mt-8">
          <CardHeader>
            <CardTitle className="text-earth-brown flex items-center gap-2">
              <Award className="h-5 w-5 text-coral-warm" />
              Succès et achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {ACHIEVEMENTS.map((achievement) => {
                const isUnlocked = stats?.achievements.includes(achievement.id);
                return (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                      isUnlocked
                        ? "bg-gradient-to-br from-coral-warm/10 to-sunshine-yellow/10 border-coral-warm/30"
                        : "bg-gray-50 border-gray-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{achievement.icon}</span>
                      <h3
                        className={`font-semibold ${
                          isUnlocked ? "text-earth-brown" : "text-gray-500"
                        }`}
                      >
                        {achievement.name}
                      </h3>
                      {isUnlocked && (
                        <Badge
                          variant="secondary"
                          className="bg-coral-warm/20 text-coral-warm ml-auto"
                        >
                          Débloqué
                        </Badge>
                      )}
                    </div>
                    <p
                      className={`text-sm ${
                        isUnlocked ? "text-earth-brown/70" : "text-gray-400"
                      }`}
                    >
                      {achievement.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Résumé du profil */}
        {profile && (
          <Card className="bg-white/90 backdrop-blur-sm shadow-warm rounded-3xl border-0 mt-8">
            <CardHeader>
              <CardTitle className="text-earth-brown flex items-center gap-2">
                <Clock className="h-5 w-5 text-coral-warm" />
                Résumé du profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-sm text-earth-brown/60 mb-1">
                    Membre depuis
                  </div>
                  <div className="font-semibold text-earth-brown">
                    {new Date(profile.created_at).toLocaleDateString("fr-FR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-earth-brown/60 mb-1">
                    Niveau déclaré
                  </div>
                  <div className="font-semibold text-earth-brown capitalize">
                    {getSkillLevelLabel(profile.skill_level)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-earth-brown/60 mb-1">
                    Sports préférés déclarés
                  </div>
                  <div className="font-semibold text-earth-brown">
                    {profile.favorite_sports.length} sport
                    {profile.favorite_sports.length > 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Stats;
