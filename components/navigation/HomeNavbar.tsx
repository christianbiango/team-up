import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Heart, Sparkles, Menu } from "lucide-react";
import teamupLogo from "@/public/assets/teamup-logo.png";
import Image from "next/image";
import InstallButton from "../InstallButton";

const HomeNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="container mx-auto px-4 py-6 relative z-10">
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-3xl p-3 md:p-4 shadow-soft">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative">
            <Image
              src={teamupLogo}
              alt="TeamUp!"
              className="h-8 md:h-12 w-auto"
            />
            <Sparkles className="absolute -top-1 -right-1 md:-top-2 md:-right-2 h-3 md:h-5 w-3 md:w-5 text-sunshine-yellow animate-pulse" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-2xl font-bold text-earth-brown">
              TeamUp!
            </h1>
            <p className="text-xs text-earth-brown/70 font-medium">
              Sport & Convivialité
            </p>
          </div>
        </div>
        <div className="sm:hidden">
          <InstallButton />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex gap-3">
          <InstallButton />
          <Button
            variant="village-outline"
            size="sm"
            className="gap-2 text-xs md:text-sm px-3 md:px-4"
            onClick={() => (window.location.href = "/auth")}
          >
            <Heart className="h-3 md:h-4 w-3 md:w-4" />
            Rejoignez-nous
          </Button>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="village-outline"
              size="sm"
              className="sm:hidden p-2"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-64 bg-white/95 backdrop-blur-sm border-l border-white/20"
          >
            <div className="flex flex-col gap-6 pt-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Image
                    src={teamupLogo}
                    alt="TeamUp!"
                    className="h-8 w-auto"
                  />
                  <Sparkles className="h-4 w-4 text-sunshine-yellow animate-pulse" />
                </div>
                <h2 className="text-xl font-bold text-earth-brown">TeamUp!</h2>
                <p className="text-sm text-earth-brown/70 font-medium">
                  Sport & Convivialité
                </p>
              </div>

              <div className="border-t border-earth-brown/10 pt-6 flex flex-col gap-4">
                <Button
                  variant="village-outline"
                  className="w-full gap-2 text-sm"
                  onClick={() => {
                    window.location.href = "/auth";
                    setIsOpen(false);
                  }}
                >
                  <Heart className="h-4 w-4" />
                  Rejoignez-nous
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default HomeNavbar;
