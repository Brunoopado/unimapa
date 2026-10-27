export type SavedRoute = {
  codigoQr: string;
  idDestino: string;
  tipoRota: "Rampa" | "Elevador" | "Escada";
};

const ROUTE_KEY = "unimapa_active_route";

export function saveActiveRoute(
  route: SavedRoute
) {
  localStorage.setItem(
    ROUTE_KEY,
    JSON.stringify(route)
  );
}

export function getActiveRoute():
  | SavedRoute
  | null {
  const saved =
    localStorage.getItem(ROUTE_KEY);

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export function clearActiveRoute() {
  localStorage.removeItem(ROUTE_KEY);
}