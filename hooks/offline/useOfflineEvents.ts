import { useState, useEffect } from "react";
import { useOffline } from "./useOffline";
import { offlineEventManager } from "@/lib/offline/offlineEventManager";

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
  is_geocoded?: boolean;
  created_at: string;
  updated_at: string;
  _offline?: boolean;
  profiles?: {
    username: string;
    full_name: string;
  };
}

export const useOfflineEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOnline } = useOffline();

  const loadEvents = async (filters?: {
    organizer_id?: string;
    upcoming?: boolean;
  }) => {
    setLoading(true);
    try {
      const eventsData = await offlineEventManager.getEvents(filters);
      setEvents(eventsData);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Partial<Event>) => {
    try {
      const newEvent = await offlineEventManager.createEvent(eventData);
      await loadEvents();
      return newEvent;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    try {
      const updatedEvent = await offlineEventManager.updateEvent(
        eventId,
        updates
      );
      await loadEvents();
      return updatedEvent;
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      await offlineEventManager.deleteEvent(eventId);
      await loadEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  };

  const joinEvent = async (eventId: string, userId: string) => {
    try {
      await offlineEventManager.joinEvent(eventId, userId);
      await loadEvents();
    } catch (error) {
      console.error("Error joining event:", error);
      throw error;
    }
  };

  const leaveEvent = async (participationId: string) => {
    try {
      await offlineEventManager.leaveEvent(participationId);
      await loadEvents();
    } catch (error) {
      console.error("Error leaving event:", error);
      throw error;
    }
  };

  useEffect(() => {
    loadEvents();

    const handleSync = () => {
      loadEvents();
    };

    window.addEventListener("sync-end", handleSync);

    return () => {
      window.removeEventListener("sync-end", handleSync);
    };
  }, []);

  return {
    events,
    loading,
    isOnline,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    joinEvent,
    leaveEvent,
  };
};
