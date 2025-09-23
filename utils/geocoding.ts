import { createClient } from "@/lib/supabase/client";

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted_address?: string;
}

export const geocodeAddress = async (
  address: string
): Promise<GeocodeResult | null> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.functions.invoke("geocode-address", {
      body: { address },
    });

    if (error) {
      console.error("Geocoding error:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error calling geocode function:", error);
    return null;
  }
};

export const geocodeEvent = async (
  eventId: string,
  address: string
): Promise<boolean> => {
  try {
    const supabase = createClient();
    const result = await geocodeAddress(address);

    if (!result) {
      console.error(`Failed to geocode address: ${address}`);
      return false;
    }

    // Update the event with coordinates
    const { error } = await supabase
      .from("events")
      .update({
        latitude: result.latitude,
        longitude: result.longitude,
        is_geocoded: true,
      })
      .eq("id", eventId);

    if (error) {
      console.error("Error updating event coordinates:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error geocoding event:", error);
    return false;
  }
};
