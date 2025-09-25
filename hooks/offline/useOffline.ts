import { useState, useEffect } from "react";
import { toast } from "sonner";

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        toast.success("Connexion rétablie ! Synchronisation en cours...", {
          duration: 3000,
        });
        window.dispatchEvent(new CustomEvent("sync-data"));
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      toast.error(
        "Mode hors ligne activé. Vos données seront synchronisées à la reconnexion.",
        {
          duration: 5000,
        }
      );
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
};
