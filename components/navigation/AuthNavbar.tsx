import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, BarChart3, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import teamupLogo from "@/public/assets/teamup-logo.png";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface AuthNavbarProps {
  userName?: string;
  userGreeting?: string;
  onSignOut: () => void;
  showStats?: boolean;
}

const AuthNavbar: React.FC<AuthNavbarProps> = ({
  userName,
  userGreeting,
  onSignOut,
  showStats = true,
}) => {
  const router = useRouter();

  const NavButtons = () => (
    <>
      {showStats && (
        <Button
          variant="village-outline"
          size="sm"
          onClick={() => router.push("/stats")}
          className="gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Stats</span>
        </Button>
      )}
      <Button
        variant="village-outline"
        size="sm"
        onClick={() => router.push("/profile")}
        className="gap-2"
      >
        <UserIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Profil</span>
      </Button>
      <Button variant="outline" size="sm" onClick={onSignOut} className="gap-2">
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Déconnexion</span>
      </Button>
    </>
  );

  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-warm border-b border-coral-warm/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            <Image
              src={teamupLogo}
              alt="TeamUp!"
              className="h-8 md:h-10 w-auto cursor-pointer flex-shrink-0"
              onClick={() => router.push("/dashboard")}
            />
            <div className="min-w-0">
              <h1 className="text-base md:text-xl font-bold text-earth-brown truncate">
                {userGreeting || `Salut ${userName?.split(" ")[0]} ! 👋`}
              </h1>
              <p className="text-xs md:text-sm text-earth-brown/70 hidden sm:block">
                Prêt pour de nouvelles aventures sportives ?
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <NavButtons />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-earth-brown">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-4 mt-6">
                  <div className="text-center pb-4 border-b border-coral-warm/10">
                    <h2 className="text-lg font-semibold text-earth-brown">
                      {userName?.split(" ")[0]}
                    </h2>
                    <p className="text-sm text-earth-brown/70">
                      Menu principal
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <NavButtons />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AuthNavbar;
