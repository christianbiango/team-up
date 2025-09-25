import { openDB, DBSchema, IDBPDatabase } from "idb";

interface TeamUpDB extends DBSchema {
  events: {
    key: string;
    value: {
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
      is_geocoded?: boolean;
      created_at: string;
      updated_at: string;
      _offline?: boolean;
      _action?: "create" | "update" | "delete";
      _timestamp?: number;
    };
  };
  participations: {
    key: string;
    value: {
      id: string;
      event_id: string;
      participant_id: string;
      created_at: string;
      _offline?: boolean;
      _action?: "create" | "delete";
      _timestamp?: number;
    };
  };
  profiles: {
    key: string;
    value: {
      id: string;
      user_id: string;
      username: string;
      full_name: string;
      bio?: string;
      avatar_url?: string;
      phone?: string;
      favorite_sports: string[];
      skill_level: string;
      availability_days: string[];
      location?: string;
      created_at: string;
      updated_at?: string;
      _offline?: boolean;
      _action?: "create" | "update";
      _timestamp?: number;
    };
  };
  sync_queue: {
    key: string;
    value: {
      id: string;
      table: "events" | "participations" | "profiles";
      action: "create" | "update" | "delete";
      data:
        | TeamUpDB["events"]["value"]
        | TeamUpDB["participations"]["value"]
        | TeamUpDB["profiles"]["value"];
      timestamp: number;
      attempts: number;
    };
  };
}

class OfflineStorage {
  private db: IDBPDatabase<TeamUpDB> | null = null;

  async init() {
    if (!this.db) {
      this.db = await openDB<TeamUpDB>("TeamUpDB", 2, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("events")) {
            db.createObjectStore("events", {
              keyPath: "id",
            });
          }

          if (!db.objectStoreNames.contains("participations")) {
            db.createObjectStore("participations", {
              keyPath: "id",
            });
          }

          if (!db.objectStoreNames.contains("profiles")) {
            db.createObjectStore("profiles", {
              keyPath: "id",
            });
          }

          if (!db.objectStoreNames.contains("sync_queue")) {
            db.createObjectStore("sync_queue", {
              keyPath: "id",
            });
          }
        },
      });
    }
    return this.db;
  }

  async saveEvent(event: TeamUpDB["events"]["value"], isOffline = false) {
    const db = await this.init();
    const eventData = {
      ...event,
      _offline: isOffline,
      _action: (event.id ? "update" : "create") as
        | "create"
        | "update"
        | "delete",
      _timestamp: Date.now(),
    };

    await db.put("events", eventData);

    if (isOffline) {
      await this.addToSyncQueue("events", eventData._action, eventData);
    }

    return eventData;
  }

  async getEvents(filters?: { organizer_id?: string; upcoming?: boolean }) {
    const db = await this.init();
    let events = await db.getAll("events");

    if (filters?.organizer_id) {
      events = events.filter(
        (event) => event.organizer_id === filters.organizer_id
      );
    }

    if (filters?.upcoming) {
      const now = new Date().toISOString();
      events = events.filter((event) => event.date_time > now);
    }

    return events.sort(
      (a, b) =>
        new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
    );
  }

  async getEventById(id: string) {
    const db = await this.init();
    return await db.get("events", id);
  }

  async deleteEvent(id: string, isOffline = false) {
    const db = await this.init();

    if (isOffline) {
      const event = await db.get("events", id);
      if (event) {
        event._offline = true;
        event._action = "delete";
        event._timestamp = Date.now();
        await db.put("events", event);
        await this.addToSyncQueue("events", "delete", { id });
      }
    } else {
      await db.delete("events", id);
    }
  }

  async saveParticipation(
    participation: TeamUpDB["participations"]["value"],
    isOffline = false
  ) {
    const db = await this.init();
    const participationData: TeamUpDB["participations"]["value"] = {
      ...participation,
      _offline: isOffline,
      _action: "create",
      _timestamp: Date.now(),
    };

    await db.put("participations", participationData);

    if (isOffline) {
      await this.addToSyncQueue("participations", "create", participationData);
    }

    return participationData;
  }

  async getParticipations(filters?: {
    event_id?: string;
    participant_id?: string;
  }) {
    const db = await this.init();
    let participations = await db.getAll("participations");

    if (filters?.event_id) {
      participations = participations.filter(
        (p) => p.event_id === filters.event_id
      );
    }

    if (filters?.participant_id) {
      participations = participations.filter(
        (p) => p.participant_id === filters.participant_id
      );
    }

    return participations;
  }

  async deleteParticipation(id: string, isOffline = false) {
    const db = await this.init();

    if (isOffline) {
      const participation = await db.get("participations", id);
      if (participation) {
        participation._offline = true;
        participation._action = "delete";
        participation._timestamp = Date.now();
        await db.put("participations", participation);
        await this.addToSyncQueue("participations", "delete", { id });
      }
    } else {
      await db.delete("participations", id);
    }
  }

  async saveProfile(profile: TeamUpDB["profiles"]["value"], isOffline = false) {
    const db = await this.init();
    const profileData = {
      ...profile,
      _offline: isOffline,
      _action: (profile.id ? "update" : "create") as "create" | "update",
      _timestamp: Date.now(),
    };

    await db.put("profiles", profileData);

    if (isOffline) {
      await this.addToSyncQueue("profiles", profileData._action, profileData);
    }

    return profileData;
  }

  async getProfile(userId: string) {
    const db = await this.init();
    const profiles = await db.getAll("profiles");
    return profiles.find((profile) => profile.user_id === userId) || null;
  }

  async addToSyncQueue(
    table: "events" | "participations" | "profiles",
    action: "create" | "update" | "delete",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  ) {
    const db = await this.init();
    const queueItem = {
      id: `${table}_${action}_${data.id || Date.now()}`,
      table,
      action,
      data,
      timestamp: Date.now(),
      attempts: 0,
    };

    await db.put("sync_queue", queueItem);
  }

  async getSyncQueue() {
    const db = await this.init();
    return await db.getAll("sync_queue");
  }

  async clearSyncItem(id: string) {
    const db = await this.init();
    await db.delete("sync_queue", id);
  }

  async incrementSyncAttempts(id: string) {
    const db = await this.init();
    const item = await db.get("sync_queue", id);
    if (item) {
      item.attempts += 1;
      await db.put("sync_queue", item);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async syncWithServer(supabase: any) {
    const queue = await this.getSyncQueue();
    console.log(`Synchronizing ${queue.length} items...`);

    for (const item of queue) {
      try {
        await this.syncItem(supabase, item);
        await this.clearSyncItem(item.id);
        console.log(`Synced: ${item.table} ${item.action}`);
      } catch (error) {
        console.error(`Failed to sync ${item.id}:`, error);
        await this.incrementSyncAttempts(item.id);

        if (item.attempts >= 3) {
          console.error(`Abandoning sync for ${item.id} after 3 attempts`);
          await this.clearSyncItem(item.id);
        }
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async syncItem(supabase: any, item: any) {
    const { table, action, data } = item;

    switch (table) {
      case "events":
        if (action === "create") {
          const { ...eventData } = data;
          await supabase.from("events").insert(eventData);
        } else if (action === "update") {
          const { ...eventData } = data;
          await supabase.from("events").update(eventData).eq("id", data.id);
        } else if (action === "delete") {
          await supabase.from("events").delete().eq("id", data.id);
        }
        break;

      case "participations":
        if (action === "create") {
          const { ...participationData } = data;
          await supabase.from("event_participants").insert(participationData);
        } else if (action === "delete") {
          await supabase.from("event_participants").delete().eq("id", data.id);
        }
        break;

      case "profiles":
        if (action === "create") {
          const { ...profileData } = data;
          await supabase.from("profiles").insert(profileData);
        } else if (action === "update") {
          const { ...profileData } = data;
          await supabase.from("profiles").update(profileData).eq("id", data.id);
        }
        break;
    }
  }

  async clearAll() {
    const db = await this.init();
    await db.clear("events");
    await db.clear("participations");
    await db.clear("profiles");
    await db.clear("sync_queue");
  }
}

export const offlineStorage = new OfflineStorage();
