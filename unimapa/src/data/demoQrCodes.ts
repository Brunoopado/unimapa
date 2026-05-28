import type { CurrentLocation } from "../types/location";

export const demoReferencePoints: CurrentLocation[] = [
  {
    pointCode: "P001",
    name: "Entrada principal",
    floor: "Térreo",
  },
  {
    pointCode: "P002",
    name: "Corredor central",
    floor: "Térreo",
  },
  {
    pointCode: "P003",
    name: "Biblioteca",
    floor: "Térreo",
  },
  {
    pointCode: "P004",
    name: "Escada principal",
    floor: "Térreo",
  },
];

export function findReferencePointByCode(code: string) {
  const normalizedCode = code.trim().toUpperCase();

  return demoReferencePoints.find(
    (point) => point.pointCode === normalizedCode
  );
}