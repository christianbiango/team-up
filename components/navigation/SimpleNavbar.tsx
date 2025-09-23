import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import teamupLogo from "@/public/assets/teamup-logo.png";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface SimpleNavbarProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  showCreateEvent?: boolean;
  actions?: React.ReactNode[];
}

export const SimpleNavbar: React.FC<SimpleNavbarProps> = ({
  title,
  subtitle,
  backTo = "/dashboard",
  backLabel = "Retour",
  showCreateEvent = false,
  actions = [],
}) => {
  const router = useRouter();

  const ActionButtons = () => (
    <>
      {showCreateEvent && (
        <Button
          variant="village"
          size="sm"
          onClick={() => router.push("/create-event")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Créer un événement</span>
        </Button>
      )}
      {actions.map((action, index) => (
        <div key={index}>{action}</div>
      ))}
    </>
  );

  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-warm border-b border-coral-warm/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(backTo)}
              className="text-earth-brown gap-2 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{backLabel}</span>
            </Button>
            <Image
              src={teamupLogo}
              alt="TeamUp!"
              className="h-6 md:h-8 w-auto flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-base md:text-xl font-bold text-earth-brown truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs md:text-sm text-earth-brown/70 hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <ActionButtons />
          </div>

          {/* Mobile Navigation */}
          {(showCreateEvent || actions.length > 0) && (
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-earth-brown"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="flex flex-col gap-4 mt-6">
                    <div className="text-center pb-4 border-b border-coral-warm/10">
                      <h2 className="text-lg font-semibold text-earth-brown truncate">
                        {title}
                      </h2>
                      {subtitle && (
                        <p className="text-sm text-earth-brown/70">
                          {subtitle}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <ActionButtons />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default SimpleNavbar;
