import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { offlineStorage } from "@/lib/offline/offlineStorage";
import { useOffline } from "@/hooks/useOffline";
import { toast } from "sonner";

export const useOfflineSync = () => {
  const { isOnline } = useOffline();

  useEffect(() => {
    const syncData = async () => {
      if (!isOnline) return;

      window.dispatchEvent(new CustomEvent("sync-start"));

      try {
        await offlineStorage.syncWithServer(supabase);
        console.log("Synchronisation terminée avec succès");
      } catch (error) {
        console.error("Erreur lors de la synchronisation:", error);
        toast.error("Erreur lors de la synchronisation des données");
      } finally {
        window.dispatchEvent(new CustomEvent("sync-end"));
      }
    };

    // Synchroniser automatiquement quand on revient en ligne
    const handleSyncData = () => {
      syncData();
    };

    // Synchroniser périodiquement quand on est en ligne
    let syncInterval: NodeJS.Timeout;
    if (isOnline) {
      syncData(); // Sync immédiat
      syncInterval = setInterval(syncData, 30000); // Toutes les 30 secondes
    }

    window.addEventListener("sync-data", handleSyncData);

    return () => {
      window.removeEventListener("sync-data", handleSyncData);
      if (syncInterval) {
        clearInterval(syncInterval);
      }
    };
  }, [isOnline]);

  const forceSyncNow = async () => {
    if (!isOnline) {
      toast.error("Impossible de synchroniser en mode hors ligne");
      return;
    }

    window.dispatchEvent(new CustomEvent("sync-start"));

    try {
      await offlineStorage.syncWithServer(supabase);
      toast.success("Synchronisation réussie !");
    } catch (error) {
      console.error("Erreur lors de la synchronisation forcée:", error);
      toast.error("Erreur lors de la synchronisation");
    } finally {
      window.dispatchEvent(new CustomEvent("sync-end"));
    }
  };

  return { forceSyncNow };
};
