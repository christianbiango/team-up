"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import SimpleNavbar from "@/components/navigation/SimpleNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { Heart, Save, Trophy, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  bio: string | null;
  phone: string | null;
  location: string | null;
  skill_level: string;
  favorite_sports: string[];
  availability_days: string[];
}

const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(20, "Le nom d'utilisateur ne peut pas dépasser 20 caractères")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscore"
    ),
  full_name: z
    .string()
    .min(2, "Le nom complet doit contenir au moins 2 caractères"),
  bio: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  skill_level: z.string(),
  favorite_sports: z.array(z.string()),
  availability_days: z.array(z.string()),
});

type ProfileFormData = z.infer<typeof profileSchema>;

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
  "Pétanque",
];

const SKILL_LEVELS = [
  { value: "beginner", label: "Débutant" },
  { value: "intermediate", label: "Intermédiaire" },
  { value: "advanced", label: "Avancé" },
  { value: "expert", label: "Expert" },
];

const DAYS = [
  { value: "monday", label: "Lundi" },
  { value: "tuesday", label: "Mardi" },
  { value: "wednesday", label: "Mercredi" },
  { value: "thursday", label: "Jeudi" },
  { value: "friday", label: "Vendredi" },
  { value: "saturday", label: "Samedi" },
  { value: "sunday", label: "Dimanche" },
];

const EditProfile = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      full_name: "",
      bio: "",
      phone: "",
      location: "",
      skill_level: "beginner",
      favorite_sports: [],
      availability_days: [],
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          router.push("/profile/creer");
          return;
        }
        throw error;
      }

      setProfile(profileData);

      // Remplir le formulaire avec les données existantes
      form.reset({
        username: profileData.username,
        full_name: profileData.full_name,
        bio: profileData.bio || "",
        phone: profileData.phone || "",
        location: profileData.location || "",
        skill_level: profileData.skill_level,
        favorite_sports: profileData.favorite_sports || [],
        availability_days: profileData.availability_days || [],
      });
    } catch (error: unknown) {
      console.error("Error loading profile:", error);
      toast.error("Impossible de charger le profil.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!profile) return;

    setIsLoading(true);
    try {
      // Vérifier si le nom d'utilisateur est disponible (sauf si c'est le même)
      if (data.username !== profile.username) {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", data.username)
          .single();

        if (existingProfile) {
          form.setError("username", {
            type: "manual",
            message: "Ce nom d'utilisateur est déjà pris",
          });
          return;
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          username: data.username,
          full_name: data.full_name,
          bio: data.bio || null,
          phone: data.phone || null,
          location: data.location || null,
          skill_level: data.skill_level,
          favorite_sports: data.favorite_sports,
          availability_days: data.availability_days,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast.success(
        "Profil mis à jour ! Vos modifications ont été enregistrées avec succès."
      );

      router.push("/profile");
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      toast.error("Une erreur est survenue lors de la mise à jour du profil.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-warm via-sunshine-light/20 to-coral-light/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral-warm"></div>
      </div>
    );
  }

  return (
    <>
      <SimpleNavbar
        title="Modifier le profil"
        backTo="/profile"
        backLabel="Mon profil"
      />
      <div className="min-h-screen bg-gradient-to-br from-cream-warm via-sunshine-light/20 to-coral-light/30 p-4">
        <div className="container mx-auto max-w-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Informations de base */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-soft rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-earth-brown flex items-center gap-2">
                    <User className="h-5 w-5 text-coral-warm" />
                    Informations de base
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom d&apos;utilisateur *</FormLabel>
                        <FormControl>
                          <Input placeholder="mon_pseudo_cool" {...field} />
                        </FormControl>
                        <FormDescription>
                          Votre identifiant unique sur la plateforme
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet *</FormLabel>
                        <FormControl>
                          <Input placeholder="Jean Dupont" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biographie</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Parlez-nous de vous, de vos passions sportives..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Contact et localisation */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-soft rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-earth-brown flex items-center gap-2">
                    <Heart className="h-5 w-5 text-coral-warm" />
                    Contact et localisation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="06 12 34 56 78" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localisation</FormLabel>
                        <FormControl>
                          <Input placeholder="Paris, France" {...field} />
                        </FormControl>
                        <FormDescription>
                          Ville ou région pour trouver des événements près de
                          chez vous
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Préférences sportives */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-soft rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-earth-brown flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-coral-warm" />
                    Préférences sportives
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="skill_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niveau général</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SKILL_LEVELS.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
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
                    name="favorite_sports"
                    render={() => (
                      <FormItem>
                        <FormLabel>Sports préférés</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                          {SPORTS.map((sport) => (
                            <FormField
                              key={sport}
                              control={form.control}
                              name="favorite_sports"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={sport}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(sport)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                sport,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== sport
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {sport}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="availability_days"
                    render={() => (
                      <FormItem>
                        <FormLabel>Jours de disponibilité</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                          {DAYS.map((day) => (
                            <FormField
                              key={day.value}
                              control={form.control}
                              name="availability_days"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={day.value}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          day.value
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                day.value,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== day.value
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {day.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
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
                  onClick={() => router.push("/profile")}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="village"
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? "Enregistrement..." : "Enregistrer"}
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
