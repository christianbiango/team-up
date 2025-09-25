"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

// Define type for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(ua);
    const safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setIsIos(iOS && safari);

    // Handle PWA install prompt for other devices
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Prevent automatic mini-infobar
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      console.log("beforeinstallprompt fired");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setOpen(true); // Open iOS instruction dialog
      return;
    }

    if (!deferredPrompt) return;

    await deferredPrompt.prompt(); // Show native install prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
  };

  return (
    <>
      <Button
        variant="village"
        size="sm"
        className="gap-2"
        onClick={handleInstallClick}
      >
        Installer l&apos;application
      </Button>

      {/* iOS install instruction dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm w-[90%] rounded-2xl p-6 bg-cream-warm shadow-lg border border-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-earth-brown font-bold">
              Installer TeamUp
            </DialogTitle>
            <DialogDescription className="mt-2 text-earth-brown/80 text-sm">
              Sur iPhone ou iPad, appuyez sur{" "}
              <span className="font-semibold">Partager</span> (icône carré avec
              une flèche), puis choisissez{" "}
              <span className="font-semibold">« Sur l’écran d’accueil »</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="text-coral-warm border-coral-warm hover:bg-coral-warm hover:text-white"
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstallButton;
