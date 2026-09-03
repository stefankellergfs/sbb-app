// Anbindung an die öffentliche transport.opendata.ch API (v1).
// Community-Wrapper auf Basis offizieller Schweizer OpenTransportData/SBB-Daten.
// Kein API-Key nötig, CORS-fähig, direkt aus dem Browser aufrufbar.
// Doku: https://transport.opendata.ch/docs.html

const BASE_URL = "https://transport.opendata.ch/v1";

export interface Coordinate {
  type: string;
  x: number;
  y: number;
}

export interface StationLocation {
  id: string | null;
  name: string;
  score: number | null;
  coordinate: Coordinate;
  distance: number | null;
}

export interface StopPoint {
  station: StationLocation;
  arrival: string | null;
  arrivalTimestamp: number | null;
  departure: string | null;
  departureTimestamp: number | null;
  delay: number | null;
  platform: string | null;
}

export interface Journey {
  name: string;
  category: string;
  categoryCode: number | null;
  number: string;
  operator: string;
  to: string;
  passList: StopPoint[];
}

export interface StationboardEntry {
  stop: StopPoint;
  name: string;
  category: string;
  number: string;
  operator: string;
  to: string;
  passList: StopPoint[];
}

export interface Section {
  journey: Journey | null;
  walk: unknown | null;
  departure: StopPoint;
  arrival: StopPoint;
}

export interface Connection {
  from: StopPoint;
  to: StopPoint;
  duration: string;
  transfers: number;
  sections: Section[];
}

export class ApiError extends Error {}

async function getJSON<T>(
  path: string,
  params: Record<string, string | number | undefined>,
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  let res: Response;
  try {
    res = await fetch(url.toString());
  } catch {
    throw new ApiError(
      "Die SBB-Fahrplandaten konnten nicht geladen werden. Prüfe die Internetverbindung.",
    );
  }
  if (!res.ok) {
    throw new ApiError(`Fahrplan-API antwortete mit Fehler ${res.status}.`);
  }
  return (await res.json()) as T;
}

export async function searchStations(query: string): Promise<StationLocation[]> {
  const data = await getJSON<{ stations: StationLocation[] }>("/locations", {
    query,
    type: "station",
  });
  return data.stations.filter((s) => s.id);
}

/**
 * Abfahrtstafel für einen Bahnhof. `datetime` erlaubt es, die Tafel für einen
 * Zeitpunkt in der (nahen) Zukunft abzufragen - so lässt sich eine Reise
 * Schritt für Schritt simulieren, ohne die reale Uhrzeit abwarten zu müssen.
 */
export async function getStationboard(
  station: string,
  opts?: { datetime?: Date; limit?: number },
): Promise<StationboardEntry[]> {
  const data = await getJSON<{ stationboard: StationboardEntry[] }>("/stationboard", {
    station,
    limit: opts?.limit ?? 10,
    datetime: opts?.datetime ? formatDateTimeParam(opts.datetime) : undefined,
  });
  return data.stationboard;
}

export async function getConnections(
  from: string,
  to: string,
  opts?: { when?: Date; limit?: number },
): Promise<Connection[]> {
  const when = opts?.when;
  const data = await getJSON<{ connections: Connection[] }>("/connections", {
    from,
    to,
    date: when ? formatDateParam(when) : undefined,
    time: when ? formatTimeParam(when) : undefined,
    limit: opts?.limit ?? 4,
  });
  return data.connections;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatDateParam(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatTimeParam(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDateTimeParam(d: Date): string {
  return `${formatDateParam(d)} ${formatTimeParam(d)}`;
}

/** "01d02:34m" -> Minuten */
export function parseDurationToMinutes(duration: string): number {
  const match = duration.match(/(\d+)d(\d+):(\d+)m?/);
  if (!match) return 0;
  const [, d, h, m] = match;
  return parseInt(d, 10) * 24 * 60 + parseInt(h, 10) * 60 + parseInt(m, 10);
}

export function normalizeStationName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}
