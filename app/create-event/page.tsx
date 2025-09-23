"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  CalendarIcon,
  Clock,
  MapPin,
  Trophy,
  Users
} from "lucide-react";

import { SimpleNavbar } from "@/components/navigation/SimpleNavbar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const eventSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  sport_type: z.string().min(1),
  date_time: z.date(),
  duration: z.number().min(30),
  max_participants: z.number().min(2).max(50),
  venue_address: z.string().optional(),
  skill_level: z.string(),
  required_equipment: z.string().optional(),
  price_per_person: z.number().min(0),
  is_private: z.boolean(),
});

type EventFormData = z.infer<typeof eventSchema>;

const SPORTS = [
  "Football",
  "Basketball",
  "Tennis",
  "Running",
  "Volley-ball",
  "Badminton",
  "Ping-pong",
  "Natation",
  "Cyclisme",
  "Escalade",
  "Fitness",
  "Yoga",
];

const SKILL_LEVELS = [
  { value: "all", label: "Tous niveaux" },
  { value: "beginner", label: "Débutant" },
  { value: "intermediate", label: "Intermédiaire" },
  { value: "advanced", label: "Avancé" },
  { value: "expert", label: "Expert" },
];

export default function CreateEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      sport_type: "",
      date_time: new Date(),
      duration: 120,
      max_participants: 10,
      venue_address: "",
      skill_level: "all",
      required_equipment: "",
      price_per_person: 0,
      is_private: false,
    },
  });

  const onSubmit = async (data: EventFormData) => {
    setIsLoading(true);
    const supabase = createClient();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Vous devez être connecté pour créer un événement.");
        router.push("/auth");
        return;
      }

      const eventData = {
        title: data.title,
        description: data.description || null,
        sport_type: data.sport_type,
        date_time: data.date_time.toISOString(),
        duration: data.duration,
        max_participants: data.max_participants,
        venue_address: data.venue_address || null,
        skill_level: data.skill_level,
        required_equipment: data.required_equipment
          ? data.required_equipment.split(",").map((item) => item.trim())
          : [],
        price_per_person: data.price_per_person,
        is_private: data.is_private,
        organizer_id: user.id,
        current_participants: 1,
        status: "open" as const,
      };

      const { error } = await supabase.from("events").insert([eventData]);
      if (error) throw error;

      toast.success("Votre événement a été créé avec succès.");

      router.push("/events");
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error(
        "Une erreur est survenue lors de la création de l'événement."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SimpleNavbar
        title="Créer un événement"
        subtitle="Organisez votre prochaine aventure sportive !"
        backTo="/dashboard"
      />
      <div className="min-h-screen bg-gradient-to-br from-cream-warm via-sunshine-light/20 to-coral-light/30 p-4">
        <div className="container mx-auto max-w-4xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Informations générales */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-earth-brown flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-coral-warm" />
                      Informations générales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titre de l&apos;événement *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Match de football au parc"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Décrivez votre événement..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sport_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sport *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un sport" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SPORTS.map((sport) => (
                                <SelectItem key={sport} value={sport}>
                                  {sport}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="skill_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Niveau requis</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SKILL_LEVELS.map((level) => (
                                <SelectItem
                                  key={level.value}
                                  value={level.value}
                                >
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Date et lieu */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-earth-brown flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-coral-warm" />
                      Date et lieu
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="date_time"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date et heure *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP à HH:mm", {
                                      locale: fr,
                                    })
                                  ) : (
                                    <span>Sélectionner une date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                              <div className="p-3 border-t">
                                <Input
                                  type="time"
                                  onChange={(e) => {
                                    if (field.value && e.target.value) {
                                      const [hours, minutes] =
                                        e.target.value.split(":");
                                      const newDate = new Date(field.value);
                                      newDate.setHours(
                                        parseInt(hours),
                                        parseInt(minutes)
                                      );
                                      field.onChange(newDate);
                                    }
                                  }}
                                />
                              </div>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Durée (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="30"
                              max="480"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 120)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="venue_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse du lieu</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Parc des Sports, Paris"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Participants et coût */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-soft">
                <CardHeader>
                  <CardTitle className="text-earth-brown flex items-center gap-2">
                    <Users className="h-5 w-5 text-coral-warm" />
                    Participants et coût
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="max_participants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre max de participants</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="2"
                              max="50"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 10)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price_per_person"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix par personne (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_private"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Événement privé
                            </FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Visible uniquement sur invitation
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Équipement requis */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-soft">
                <CardHeader>
                  <CardTitle className="text-earth-brown flex items-center gap-2">
                    <Clock className="h-5 w-5 text-coral-warm" />
                    Équipement requis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="required_equipment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Équipement nécessaire</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Chaussures de sport, bouteille d'eau (séparés par des virgules)"
                            {...field}
                          />
                        </FormControl>
                        <div className="text-sm text-muted-foreground">
                          Séparez chaque équipement par une virgule
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Boutons d'action */}
              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="village-outline"
                  onClick={() => router.back()}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="village"
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? "Création..." : "Créer l'événement"}
                  <Trophy className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
