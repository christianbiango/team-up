import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useOffline } from "@/hooks/offline/useOffline";
import { offlineStorage } from "@/lib/offline/offlineStorage";
import { CloudOff, RotateCcw, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export const OfflineIndicator = () => {
  const { isOnline } = useOffline();
  const [pendingSync, setPendingSync] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const checkPendingSync = async () => {
      const queue = await offlineStorage.getSyncQueue();
      setPendingSync(queue.length);
    };

    checkPendingSync();

    const handleSyncStart = () => setIsSyncing(true);
    const handleSyncEnd = () => {
      setIsSyncing(false);
      checkPendingSync();
    };

    window.addEventListener("sync-start", handleSyncStart);
    window.addEventListener("sync-end", handleSyncEnd);
    window.addEventListener("sync-data", checkPendingSync);

    const interval = setInterval(checkPendingSync, 5000);

    return () => {
      window.removeEventListener("sync-start", handleSyncStart);
      window.removeEventListener("sync-end", handleSyncEnd);
      window.removeEventListener("sync-data", checkPendingSync);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && pendingSync === 0 && !isSyncing) {
    return null;
  }

  return (
    <Card className="fixed top-4 right-4 z-50 bg-white/95 backdrop-blur-sm shadow-lg border-0 max-w-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-meadow-green" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium text-earth-brown">
              {isOnline ? "En ligne" : "Hors ligne"}
            </span>
          </div>

          {(pendingSync > 0 || isSyncing) && (
            <div className="flex items-center gap-2">
              {isSyncing ? (
                <>
                  <RotateCcw className="h-4 w-4 text-coral-warm animate-spin" />
                  <span className="text-sm text-coral-warm">Sync...</span>
                </>
              ) : (
                <>
                  <CloudOff className="h-4 w-4 text-sunshine-yellow" />
                  <Badge
                    variant="secondary"
                    className="bg-sunshine-yellow/10 text-sunshine-yellow"
                  >
                    {pendingSync} en attente
                  </Badge>
                </>
              )}
            </div>
          )}
        </div>

        {!isOnline && (
          <p className="text-xs text-earth-brown/70 mt-2">
            Vos modifications seront synchronisées automatiquement à la
            reconnexion.
          </p>
        )}

        {isOnline && pendingSync > 0 && !isSyncing && (
          <p className="text-xs text-earth-brown/70 mt-2">
            Synchronisation automatique en cours...
          </p>
        )}
      </CardContent>
    </Card>
  );
};
