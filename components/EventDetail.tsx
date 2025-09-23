"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  DollarSign,
  Edit,
  MapPin,
  Share2,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// import { useOfflineEvents } from "@/hooks/useOfflineEvents";
import GoogleMap from "@/components/GoogleMap";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import SimpleNavbar from "./navigation/SimpleNavbar";

interface Event {
  id: string;
  title: string;
  description: string;
  sport_type: string;
  skill_level: string;
  date_time: string;
  duration: number;
  max_participants: number;
  current_participants: number;
  price_per_person: number;
  venue_address: string;
  organizer_id: string;
  status: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  profiles?: {
    username: string;
    full_name: string;
  };
}

interface Participant {
  id: string;
  participant_id: string;
  status: string;
  joined_at: string;
  profiles: {
    username: string;
    full_name: string;
  };
}

interface EventDetailProps {
  id: string;
}

const EventDetail = ({ id }: EventDetailProps) => {
  const router = useRouter();
  // const { joinEvent, leaveEvent } = useOfflineEvents();

  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userParticipation, setUserParticipation] =
    useState<Participant | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (id) {
      fetchEventDetails();
      getCurrentUser();
    }
  }, [id]);

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchEventDetails = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*, profiles(username, full_name)")
        .eq("id", id)
        .single();

      if (eventError) {
        console.error("Error fetching event:", eventError);
        toast.error("Impossible de charger l'événement");
        return;
      }

      setEvent(eventData);

      const { data: participantsData, error: participantsError } =
        await supabase
          .from("event_participants")
          .select(
            "id, participant_id, status, joined_at, profiles(username, full_name)"
          )
          .eq("event_id", id)
          .eq("status", "confirmed");

      if (participantsError) console.error(participantsError);
      else
        setParticipants(
          (participantsData || []).map((p) => ({
            ...p,
            profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles,
          }))
        );

      if (currentUser) {
        const userParticipation = participantsData
          ?.map((p) => ({
            ...p,
            profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles,
          }))
          .find((p) => p.participant_id === currentUser.id);
        setUserParticipation(userParticipation || null);
      }
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // const handleJoinEvent = async () => {
  //   if (!event || !currentUser) return;

  //   if (participants.length >= event.max_participants) {
  //     toast.error("Nombre maximum de participants atteint");
  //     return;
  //   }

  //   try {
  //     await joinEvent(event.id, currentUser.id);
  //     toast.success("Vous participez maintenant à cet événement");
  //     fetchEventDetails();
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Impossible de rejoindre l'événement");
  //   }
  // };

  // const handleLeaveEvent = async () => {
  //   if (!userParticipation) return;

  //   try {
  //     await leaveEvent(userParticipation.id);
  //     toast.success("Vous ne participez plus à cet événement");
  //     fetchEventDetails();
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Impossible d'annuler la participation");
  //   }
  // };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return remainingMinutes > 0
        ? `${hours}h${remainingMinutes}`
        : `${hours}h`;
    }
    return `${remainingMinutes}min`;
  };

  const canEdit = currentUser && event && currentUser.id === event.organizer_id;
  const canJoin =
    currentUser &&
    event &&
    !userParticipation &&
    currentUser.id !== event.organizer_id;
  const canLeave = userParticipation && currentUser?.id !== event?.organizer_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest-fresh via-sage-light to-coral-warm/20 flex items-center justify-center">
        <div className="text-earth-brown">Chargement...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest-fresh via-sage-light to-coral-warm/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-earth-brown mb-4">
            Événement non trouvé
          </h2>
          <Button onClick={() => router.push("/events")} variant="outline">
            Retour aux événements
          </Button>
        </div>
      </div>
    );
  }

  const headerActions = [];

  if (canEdit) {
    headerActions.push(
      <Button key="edit" variant="outline" size="sm" className="gap-2">
        <Edit className="h-4 w-4" />
        <span className="hidden sm:inline">Modifier</span>
      </Button>
    );
    headerActions.push(
      <Button key="delete" variant="outline" size="sm">
        <Trash2 className="h-4 w-4" />
      </Button>
    );
  }

  headerActions.push(
    <Button key="share" variant="outline" size="sm" className="gap-2">
      <Share2 className="h-4 w-4" />
      <span className="hidden sm:inline">Partager</span>
    </Button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-fresh via-sage-light to-coral-warm/20">
      <SimpleNavbar
        title={event?.title || "Événement"}
        backTo="/events"
        backLabel="Événements"
        actions={headerActions}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Header */}
            <Card>
              <CardHeader>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">{event.sport_type}</Badge>
                  <Badge variant="outline">{event.skill_level}</Badge>
                  <Badge
                    variant={event.status === "open" ? "default" : "secondary"}
                    className={
                      event.status === "open"
                        ? "bg-forest-fresh text-white"
                        : ""
                    }
                  >
                    {event.status === "open" ? "Ouvert" : "Fermé"}
                  </Badge>
                </div>
                <CardTitle className="text-2xl text-earth-brown">
                  {event.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-earth-brown/80">{event.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-earth-brown/70">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.date_time)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-earth-brown/70">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatTime(event.date_time)} ·{" "}
                      {formatDuration(event.duration)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-earth-brown/70">
                    <MapPin className="h-4 w-4" />
                    <span>{event.venue_address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-earth-brown/70">
                    <Users className="h-4 w-4" />
                    <span>
                      {participants.length}/{event.max_participants}{" "}
                      participants
                    </span>
                  </div>
                  {event.price_per_person > 0 && (
                    <div className="flex items-center gap-2 text-earth-brown/70">
                      <DollarSign className="h-4 w-4" />
                      <span>{event.price_per_person}€ par personne</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            {event.latitude && event.longitude && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-earth-brown">
                    Localisation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 rounded-lg overflow-hidden">
                    <GoogleMap
                      center={{
                        lat: Number(event.latitude),
                        lng: Number(event.longitude),
                      }}
                      zoom={15}
                      markers={[
                        {
                          position: {
                            lat: Number(event.latitude),
                            lng: Number(event.longitude),
                          },
                          title: event.title,
                        },
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Organizer */}
            <Card>
              <CardHeader>
                <CardTitle className="text-earth-brown">Organisateur</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-coral-warm text-white">
                      {event.profiles?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-earth-brown">
                      {event.profiles?.full_name}
                    </p>
                    <p className="text-sm text-earth-brown/70">
                      @{event.profiles?.username}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Button */}
            <Card>
              <CardContent className="pt-6">
                {canJoin && (
                  <Button
                    onClick={() => console.log("Join event")}
                    className="w-full bg-forest-fresh hover:bg-forest-fresh/90 text-white"
                    disabled={participants.length >= event.max_participants}
                  >
                    {participants.length >= event.max_participants
                      ? "Événement complet"
                      : "Rejoindre l'événement"}
                  </Button>
                )}
                {canLeave && (
                  <Button
                    onClick={() => console.log("Leave event")}
                    variant="outline"
                    className="w-full border-coral-warm text-coral-warm hover:bg-coral-warm hover:text-white"
                    disabled
                  >
                    Annuler ma participation
                  </Button>
                )}
                {!currentUser && (
                  <Button
                    onClick={() => router.push("/auth")}
                    className="w-full bg-forest-fresh hover:bg-forest-fresh/90 text-white"
                  >
                    Se connecter pour participer
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle className="text-earth-brown flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participants ({participants.length}/{event.max_participants})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-3"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-sage-light text-earth-brown text-xs">
                          {participant.profiles.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-earth-brown truncate">
                          {participant.profiles.full_name}
                        </p>
                        <p className="text-xs text-earth-brown/70">
                          @{participant.profiles.username}
                        </p>
                      </div>
                      {participant.participant_id === event.organizer_id && (
                        <Badge variant="secondary" className="text-xs">
                          <Trophy className="h-3 w-3 mr-1" />
                          Organisateur
                        </Badge>
                      )}
                    </div>
                  ))}
                  {participants.length === 0 && (
                    <p className="text-sm text-earth-brown/70 text-center py-4">
                      Aucun participant pour le moment
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
