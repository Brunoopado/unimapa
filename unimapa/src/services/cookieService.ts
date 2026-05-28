import Cookies from "js-cookie";
import type { CurrentLocation, RoutePreference } from "../types/location";

const CURRENT_LOCATION_COOKIE = "unimapa_current_location";
const ROUTE_PREFERENCE_COOKIE = "unimapa_route_preference";

export function saveCurrentLocation(location: CurrentLocation) {
  Cookies.set(CURRENT_LOCATION_COOKIE, JSON.stringify(location), {
    expires: 7,
  });
}

export function getCurrentLocation(): CurrentLocation | null {
  const savedLocation = Cookies.get(CURRENT_LOCATION_COOKIE);

  if (!savedLocation) {
    return null;
  }

  try {
    return JSON.parse(savedLocation) as CurrentLocation;
  } catch {
    return null;
  }
}

export function saveRoutePreference(preference: RoutePreference) {
  Cookies.set(ROUTE_PREFERENCE_COOKIE, preference, {
    expires: 7,
  });
}

export function getRoutePreference(): RoutePreference {
  const preference = Cookies.get(ROUTE_PREFERENCE_COOKIE);

  if (
    preference === "stairs" ||
    preference === "ramps" ||
    preference === "elevators"
  ) {
    return preference;
  }

  return "stairs";
}

export function clearUserCookies() {
  Cookies.remove(CURRENT_LOCATION_COOKIE);
  Cookies.remove(ROUTE_PREFERENCE_COOKIE);
}