export type Region =
  | "ostschweiz"
  | "mittelland"
  | "nordwestschweiz"
  | "zentralschweiz"
  | "romandie"
  | "tessin"
  | "graubuenden";

export interface StationInfo {
  name: string;
  region: Region;
  canton: string;
}

// Bewusst kuratierte Auswahl bekannter, gut angebundener Bahnhöfe quer durch
// die Schweiz - Grossstädte und ein paar reizvolle Ziele für Zug-Fans.
export const STATIONS: StationInfo[] = [
  { name: "Zürich HB", region: "ostschweiz", canton: "ZH" },
  { name: "Winterthur", region: "ostschweiz", canton: "ZH" },
  { name: "St. Gallen", region: "ostschweiz", canton: "SG" },
  { name: "Schaffhausen", region: "ostschweiz", canton: "SH" },
  { name: "Rapperswil", region: "ostschweiz", canton: "SG" },
  { name: "Chur", region: "graubuenden", canton: "GR" },
  { name: "Davos Platz", region: "graubuenden", canton: "GR" },
  { name: "St. Moritz", region: "graubuenden", canton: "GR" },
  { name: "Bern", region: "mittelland", canton: "BE" },
  { name: "Thun", region: "mittelland", canton: "BE" },
  { name: "Interlaken Ost", region: "mittelland", canton: "BE" },
  { name: "Biel/Bienne", region: "mittelland", canton: "BE" },
  { name: "Fribourg/Freiburg", region: "mittelland", canton: "FR" },
  { name: "Basel SBB", region: "nordwestschweiz", canton: "BS" },
  { name: "Olten", region: "nordwestschweiz", canton: "SO" },
  { name: "Aarau", region: "nordwestschweiz", canton: "AG" },
  { name: "Baden", region: "nordwestschweiz", canton: "AG" },
  { name: "Luzern", region: "zentralschweiz", canton: "LU" },
  { name: "Zug", region: "zentralschweiz", canton: "ZG" },
  { name: "Schwyz", region: "zentralschweiz", canton: "SZ" },
  { name: "Andermatt", region: "zentralschweiz", canton: "UR" },
  { name: "Lausanne", region: "romandie", canton: "VD" },
  { name: "Genève", region: "romandie", canton: "GE" },
  { name: "Montreux", region: "romandie", canton: "VD" },
  { name: "Neuchâtel", region: "romandie", canton: "NE" },
  { name: "Sion", region: "romandie", canton: "VS" },
  { name: "Zermatt", region: "romandie", canton: "VS" },
  { name: "Lugano", region: "tessin", canton: "TI" },
  { name: "Locarno", region: "tessin", canton: "TI" },
  { name: "Bellinzona", region: "tessin", canton: "TI" },
];

// Regionen-Paare, die als "grosse Reise" quer durchs Land gelten.
const FAR_REGION_PAIRS: [Region, Region][] = [
  ["romandie", "tessin"],
  ["romandie", "graubuenden"],
  ["ostschweiz", "romandie"],
  ["ostschweiz", "tessin"],
  ["graubuenden", "nordwestschweiz"],
  ["tessin", "nordwestschweiz"],
];

export function areFarRegions(a: Region, b: Region): boolean {
  return FAR_REGION_PAIRS.some(
    ([x, y]) => (x === a && y === b) || (x === b && y === a),
  );
}
