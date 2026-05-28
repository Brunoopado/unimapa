export type RoutePreference = "stairs" | "ramps" | "elevators";

export interface CurrentLocation {
  pointCode: string;
  name: string;
  floor: string;
}