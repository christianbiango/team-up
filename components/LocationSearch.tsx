"use client";

import React, { useRef, useEffect } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { env } from "@/config/env";

interface LocationSearchProps {
  onLocationSelect: (location: {
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
  placeholder?: string;
  className?: string;
  value?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  placeholder = "Rechercher une adresse...",
  className = "",
  value = "",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    const initAutocomplete = async () => {
      const loader = new Loader({
        apiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        version: "weekly",
        libraries: ["places"],
      });

      try {
        await loader.load();

        if (inputRef.current) {
          autocompleteRef.current = new google.maps.places.Autocomplete(
            inputRef.current,
            {
              componentRestrictions: { country: "fr" },
              fields: ["formatted_address", "geometry"],
            }
          );

          autocompleteRef.current.addListener("place_changed", () => {
            const place = autocompleteRef.current?.getPlace();

            if (place?.geometry?.location && place.formatted_address) {
              onLocationSelect({
                address: place.formatted_address,
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng(),
              });
            }
          });
        }
      } catch (error) {
        console.error("Error loading Google Places:", error);
      }
    };

    initAutocomplete();
  }, [onLocationSelect]);

  return (
    <div className={`relative ${className}`}>
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-earth-brown/50" />
      <Input
        ref={inputRef}
        placeholder={placeholder}
        defaultValue={value}
        className="pl-10 border-coral-warm/20 focus:border-coral-warm"
      />
    </div>
  );
};

export default LocationSearch;
