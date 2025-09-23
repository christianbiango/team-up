"use client";
import GoogleMap from "@/components/GoogleMap";
import LocationSearch from "@/components/LocationSearch";
import SimpleNavbar from "@/components/navigation/SimpleNavbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateDistance, useGeolocation } from "@/hooks/useGeolocation";
import { createClient } from "@/lib/supabase/client";
import { geocodeEvent } from "@/utils/geocoding";
import {
  Calendar,
  Clock,
  Filter,
  Map,
  MapPin,
  Navigation,
  Plus,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  description: string | null;
  sport_type: string;
  skill_level: string;
  date_time: string;
  duration: number;
  max_participants: number;
  current_participants: number;
  price_per_person: number;
  venue_address: string | null;
  status: string;
  latitude: number | null;
  longitude: number | null;
  is_geocoded: boolean | null;
  profiles: {
    username: string;
    full_name: string;
  };
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [maxDistance, setMaxDistance] = useState<string>("all");
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const router = useRouter();

  const {
    latitude,
    longitude,
    error: locationError,
    getCurrentPosition,
  } = useGeolocation();

  const supabase = createClient();

  const sports = [
    "Football",
    "Basketball",
    "Tennis",
    "Running",
    "Volleyball",
    "Badminton",
    "Pétanque",
    "Cyclisme",
    "Natation",
    "Escalade",
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      setUserLocation({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
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
        .neq("status", "cancelled")
        .order("date_time", { ascending: true });

      if (error) throw error;
      const eventsData = data || [];

      // Géocoder automatiquement les événements qui n'ont pas de coordonnées
      interface EventToGeocode {
        id: string;
        venue_address: string;
        is_geocoded: boolean;
      }

      const eventsToGeocode: EventToGeocode[] = eventsData.filter(
        (event: EventToGeocode) => event.venue_address && !event.is_geocoded
      );

      if (eventsToGeocode.length > 0) {
        console.log(`Geocoding ${eventsToGeocode.length} events...`);

        for (const event of eventsToGeocode) {
          try {
            await geocodeEvent(event.id, event.venue_address);
          } catch (error) {
            console.error(`Failed to geocode event ${event.id}:`, error);
          }
        }

        // Re-fetch events to get updated coordinates
        const { data: updatedData } = await supabase
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
          .neq("status", "cancelled")
          .order("date_time", { ascending: true });

        setEvents(updatedData || []);
      } else {
        setEvents(eventsData);
      }
    } catch (error: unknown) {
      console.error("Error fetching events:", error);
      toast.error("Erreur lors du chargement des événements");
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = useCallback(() => {
    let filtered = events;

    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.sport_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.venue_address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par sport
    if (selectedSport !== "all") {
      filtered = filtered.filter(
        (event) =>
          event.sport_type.toLowerCase() === selectedSport.toLowerCase()
      );
    }

    // Filtrer par niveau
    if (selectedLevel !== "all") {
      filtered = filtered.filter(
        (event) =>
          event.skill_level === selectedLevel || event.skill_level === "all"
      );
    }

    // Filtrer par distance
    if (maxDistance !== "all" && userLocation) {
      const maxDistanceKm = parseInt(maxDistance);
      filtered = filtered.filter((event) => {
        if (!event.latitude || !event.longitude) return false;
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          event.latitude,
          event.longitude
        );
        return distance <= maxDistanceKm;
      });
    }

    // Trier par distance si l'utilisateur a une position
    if (userLocation) {
      filtered.sort((a, b) => {
        if (!a.latitude || !a.longitude) return 1;
        if (!b.latitude || !b.longitude) return -1;

        const distanceA = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          a.latitude,
          a.longitude
        );
        const distanceB = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          b.latitude,
          b.longitude
        );

        return distanceA - distanceB;
      });
    }

    setFilteredEvents(filtered);
  }, [
    events,
    searchTerm,
    selectedSport,
    selectedLevel,
    maxDistance,
    userLocation,
  ]);

  useEffect(() => {
    filterEvents();
  }, [filterEvents]);
  const getEventDistance = (event: Event): string => {
    console.log("event", event);
    if (!userLocation || !event.latitude || !event.longitude) {
      return "";
    }

    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      event.latitude,
      event.longitude
    );

    return distance < 1
      ? `${Math.round(distance * 1000)}m`
      : `${distance.toFixed(1)}km`;
  };

  const handleLocationSearch = (location: {
    address: string;
    latitude: number;
    longitude: number;
  }) => {
    setUserLocation({ lat: location.latitude, lng: location.longitude });
    toast.success(`Position mise à jour : ${location.address}`);
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins ? mins.toString().padStart(2, "0") : ""}`;
    }
    return `${mins}min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-warm via-sunshine-light/20 to-coral-light/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral-warm"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-warm via-sunshine-light/20 to-coral-light/30">
      {/* Header */}
      <SimpleNavbar
        title="Événements sportifs"
        subtitle="Découvrez et rejoignez les activités près de chez vous"
        showCreateEvent={true}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Filtres */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-warm rounded-3xl border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-earth-brown">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres de recherche
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMap(!showMap)}
                className="text-coral-warm hover:text-coral-warm/80"
              >
                <Map className="h-4 w-4 mr-2" />
                {showMap ? "Masquer la carte" : "Voir la carte"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-earth-brown/50" />
                <Input
                  placeholder="Rechercher des événements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-coral-warm/20 focus:border-coral-warm"
                />
              </div>

              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger className="border-coral-warm/20 focus:border-coral-warm">
                  <SelectValue placeholder="Tous les sports" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les sports</SelectItem>
                  {sports.map((sport) => (
                    <SelectItem key={sport} value={sport}>
                      {sport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="border-coral-warm/20 focus:border-coral-warm">
                  <SelectValue placeholder="Tous les niveaux" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  <SelectItem value="beginner">Débutant</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire</SelectItem>
                  <SelectItem value="advanced">Avancé</SelectItem>
                </SelectContent>
              </Select>

              <Select value={maxDistance} onValueChange={setMaxDistance}>
                <SelectTrigger className="border-coral-warm/20 focus:border-coral-warm">
                  <SelectValue placeholder="Distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes distances</SelectItem>
                  <SelectItem value="2">Dans les 2 km</SelectItem>
                  <SelectItem value="5">Dans les 5 km</SelectItem>
                  <SelectItem value="10">Dans les 10 km</SelectItem>
                  <SelectItem value="25">Dans les 25 km</SelectItem>
                  <SelectItem value="50">Dans les 50 km</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Géolocalisation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getCurrentPosition}
                  className="border-coral-warm/20 text-coral-warm hover:bg-coral-warm/10"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Ma position actuelle
                </Button>
                {locationError && (
                  <p className="text-sm text-red-600">{locationError}</p>
                )}
              </div>

              <LocationSearch
                onLocationSelect={handleLocationSearch}
                placeholder="Rechercher près d'une adresse..."
              />
            </div>

            <div className="flex items-center justify-between text-sm text-earth-brown/70">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                {filteredEvents.length} événement
                {filteredEvents.length > 1 ? "s" : ""} trouvé
                {filteredEvents.length > 1 ? "s" : ""}
              </div>
              {userLocation && (
                <div className="text-meadow-green">📍 Position définie</div>
              )}
            </div>

            {/* Carte */}
            {showMap && (
              <div className="mt-6">
                <GoogleMap
                  center={userLocation || { lat: 48.8566, lng: 2.3522 }} // Paris par défaut
                  zoom={12}
                  markers={filteredEvents
                    .filter((event) => event.latitude && event.longitude)
                    .map((event) => ({
                      position: { lat: event.latitude!, lng: event.longitude! },
                      title: event.title,
                      onClick: () => router.push(`/events/${event.id}`),
                    }))}
                  className="w-full h-96 rounded-2xl shadow-warm"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Liste des événements */}
        {filteredEvents.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm shadow-warm rounded-3xl border-0">
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 mx-auto text-earth-brown/30 mb-4" />
              <h3 className="text-xl font-semibold text-earth-brown mb-2">
                Aucun événement trouvé
              </h3>
              <p className="text-earth-brown/70 mb-6">
                {searchTerm ||
                selectedSport !== "all" ||
                selectedLevel !== "all"
                  ? "Essayez de modifier vos critères de recherche"
                  : "Soyez le premier à créer un événement dans votre région !"}
              </p>
              <Button
                variant="village"
                onClick={() => router.push("/create-event")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer un événement
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card
                key={event.id}
                className="bg-white/90 backdrop-blur-sm shadow-warm rounded-3xl border-0 hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={() => router.push(`/events/${event.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge
                      variant="secondary"
                      className="bg-coral-warm/10 text-coral-warm font-medium"
                    >
                      {event.sport_type}
                    </Badge>
                    <div className="flex gap-2">
                      {event.skill_level !== "all" && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {event.skill_level}
                        </Badge>
                      )}
                      <Badge
                        variant={
                          event.current_participants >= event.max_participants
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {event.current_participants}/{event.max_participants}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="font-bold text-earth-brown mb-2 text-lg line-clamp-2">
                    {event.title}
                  </h3>

                  {event.description && (
                    <p className="text-earth-brown/70 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm text-earth-brown/70 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-coral-warm" />
                      {formatDate(event.date_time)} ·{" "}
                      {formatDuration(event.duration)}
                    </div>
                    {event.venue_address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-meadow-green" />
                        <span className="line-clamp-1 flex-1">
                          {event.venue_address}
                        </span>
                        {getEventDistance(event) && (
                          <Badge
                            variant="outline"
                            className="text-xs text-meadow-green"
                          >
                            {getEventDistance(event)}
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-sunshine-yellow" />
                      Organisé par {event.profiles.full_name}
                    </div>
                    {event.price_per_person > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-terracotta">
                          {event.price_per_person}€ par personne
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    variant={
                      event.current_participants >= event.max_participants
                        ? "outline"
                        : "village-soft"
                    }
                    size="sm"
                    className="w-full"
                    disabled={
                      event.current_participants >= event.max_participants
                    }
                  >
                    {event.current_participants >= event.max_participants
                      ? "Complet"
                      : "Voir les détails"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Events;
