import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { env } from "@/config/env";

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title: string;
    onClick?: () => void;
  }>;
  onMapClick?: (event: google.maps.MapMouseEvent) => void;
  className?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  center,
  zoom = 10,
  markers = [],
  onMapClick,
  className = "w-full h-64 rounded-lg",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        version: "weekly",
        libraries: ["places"],
      });

      try {
        await loader.load();

        if (mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center,
            zoom,
            styles: [
              {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [{ color: "hsl(25, 35%, 35%)" }],
              },
              {
                featureType: "poi.park",
                elementType: "geometry.fill",
                stylers: [{ color: "hsl(150, 60%, 85%)" }],
              },
            ],
          });

          if (onMapClick) {
            mapInstance.addListener("click", onMapClick);
          }

          setMap(mapInstance);
          setIsLoaded(true);
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };

    initMap();
  }, []);

  // Update markers when they change
  useEffect(() => {
    if (!map || !isLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData) => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map,
        title: markerData.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "hsl(14, 88%, 65%)",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "white",
          scale: 8,
        },
      });

      if (markerData.onClick) {
        marker.addListener("click", markerData.onClick);
      }

      markersRef.current.push(marker);
    });
  }, [map, markers, isLoaded]);

  // Update center when it changes
  useEffect(() => {
    if (map && isLoaded) {
      map.setCenter(center);
    }
  }, [map, center, isLoaded]);

  return (
    <div className={className}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  );
};

export default GoogleMap;
