import { offlineStorage } from "./offlineStorage";
import { toast } from "sonner";
import { createClient } from "../supabase/client";
import { generateUUID } from "@/utils/generate-uuid";

export class OfflineEventManager {
  private isOnline: boolean;
  private supabase = createClient();

  constructor() {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      this.isOnline = navigator.onLine;

      window.addEventListener("online", () => {
        this.isOnline = true;
      });

      window.addEventListener("offline", () => {
        this.isOnline = false;
      });
    } else {
      this.isOnline = true;
    }
  }

  async createEvent(eventData: any) {
    const eventId = generateUUID();
    const event = {
      ...eventData,
      id: eventId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isOnline) {
      try {
        const { data, error } = await this.supabase
          .from("events")
          .insert([event])
          .select()
          .single();

        if (error) throw error;

        // Sauvegarder en local aussi
        await offlineStorage.saveEvent(data, false);
        return data;
      } catch (error) {
        console.error("Failed to create event online, saving offline:", error);
        return await this.createEventOffline(event);
      }
    } else {
      return await this.createEventOffline(event);
    }
  }

  private async createEventOffline(event: any) {
    await offlineStorage.saveEvent(event, true);
    toast.success(
      "Événement créé hors ligne. Il sera synchronisé automatiquement.",
      {
        duration: 4000,
      }
    );
    return event;
  }

  async updateEvent(eventId: string, updates: any) {
    const updatedEvent = {
      ...updates,
      id: eventId,
      updated_at: new Date().toISOString(),
    };

    if (this.isOnline) {
      try {
        const { data, error } = await this.supabase
          .from("events")
          .update(updatedEvent)
          .eq("id", eventId)
          .select()
          .single();

        if (error) throw error;

        await offlineStorage.saveEvent(data, false);
        return data;
      } catch (error) {
        console.error("Failed to update event online, saving offline:", error);
        return await this.updateEventOffline(updatedEvent);
      }
    } else {
      return await this.updateEventOffline(updatedEvent);
    }
  }

  private async updateEventOffline(event: any) {
    await offlineStorage.saveEvent(event, true);
    toast.success(
      "Modifications sauvegardées hors ligne. Elles seront synchronisées automatiquement.",
      {
        duration: 4000,
      }
    );
    return event;
  }

  async deleteEvent(eventId: string) {
    if (this.isOnline) {
      try {
        const { error } = await this.supabase
          .from("events")
          .delete()
          .eq("id", eventId);

        if (error) throw error;

        await offlineStorage.deleteEvent(eventId, false);
        return true;
      } catch (error) {
        console.error(
          "Failed to delete event online, marking for deletion:",
          error
        );
        return await this.deleteEventOffline(eventId);
      }
    } else {
      return await this.deleteEventOffline(eventId);
    }
  }

  private async deleteEventOffline(eventId: string) {
    await offlineStorage.deleteEvent(eventId, true);
    toast.success(
      "Événement marqué pour suppression. Il sera supprimé lors de la synchronisation.",
      {
        duration: 4000,
      }
    );
    return true;
  }

  async joinEvent(eventId: string, userId: string) {
    const participationId = generateUUID();
    const participation = {
      id: participationId,
      event_id: eventId,
      participant_id: userId,
      created_at: new Date().toISOString(),
    };

    if (this.isOnline) {
      try {
        const { data, error } = await this.supabase
          .from("event_participants")
          .insert([participation])
          .select()
          .single();

        console.log("error:", error);
        if (error) throw error;
        await offlineStorage.saveParticipation(data, false);
        return data;
      } catch (error) {
        console.error("Failed to join event online, saving offline:", error);
        return await this.joinEventOffline(participation);
      }
    } else {
      return await this.joinEventOffline(participation);
    }
  }

  private async joinEventOffline(participation: any) {
    await offlineStorage.saveParticipation(participation, true);
    toast.success(
      "Participation enregistrée hors ligne. Elle sera synchronisée automatiquement.",
      {
        duration: 4000,
      }
    );
    return participation;
  }

  async leaveEvent(participationId: string) {
    console.log("Leaving event with participationId:", participationId);
    if (this.isOnline) {
      try {
        const { error } = await this.supabase
          .from("event_participants")
          .delete()
          .eq("id", participationId);

        if (error) throw error;

        await offlineStorage.deleteParticipation(participationId, false);
        return true;
      } catch (error) {
        console.error(
          "Failed to leave event online, marking for deletion:",
          error
        );
        return await this.leaveEventOffline(participationId);
      }
    } else {
      return await this.leaveEventOffline(participationId);
    }
  }

  private async leaveEventOffline(participationId: string) {
    await offlineStorage.deleteParticipation(participationId, true);
    toast.success(
      "Participation annulée hors ligne. Le changement sera synchronisé automatiquement.",
      {
        duration: 4000,
      }
    );
    return true;
  }

  async getEvents(filters?: { organizer_id?: string; upcoming?: boolean }) {
    // Toujours essayer d'abord les données locales
    const localEvents = await offlineStorage.getEvents(filters);

    if (this.isOnline) {
      try {
        let query = this.supabase.from("events").select(`
          *,
          profiles!events_organizer_id_fkey (
            username,
            full_name
          )
        `);

        if (filters?.organizer_id) {
          query = query.eq("organizer_id", filters.organizer_id);
        }

        if (filters?.upcoming) {
          query = query.gte("date_time", new Date().toISOString());
        }

        const { data, error } = await query.order("date_time", {
          ascending: true,
        });

        if (error) throw error;

        // Fusionner avec les données locales
        const onlineEvents = data || [];
        const mergedEvents = this.mergeEvents(localEvents, onlineEvents);

        // Mettre à jour le cache local avec les nouvelles données
        for (const event of onlineEvents) {
          await offlineStorage.saveEvent(event, false);
        }

        return mergedEvents;
      } catch (error) {
        console.error(
          "Failed to fetch events online, using local data:",
          error
        );
        return localEvents;
      }
    } else {
      return localEvents;
    }
  }

  private mergeEvents(localEvents: any[], onlineEvents: any[]) {
    const merged = [...onlineEvents];

    // Ajouter les événements locaux qui ne sont pas en ligne
    for (const localEvent of localEvents) {
      if (localEvent._offline && !merged.find((e) => e.id === localEvent.id)) {
        merged.push(localEvent);
      }
    }

    return merged.sort(
      (a, b) =>
        new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
    );
  }
}

export const offlineEventManager = new OfflineEventManager();
