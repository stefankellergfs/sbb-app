import { STATIONS, areFarRegions } from "../data/stations";
import type { TravelStation } from "./types";

export type Difficulty = "kurz" | "mittel" | "lang";

export interface Challenge {
  from: TravelStation;
  to: TravelStation;
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function generateChallenge(difficulty: Difficulty): Challenge {
  const from = pickRandom(STATIONS);

  let candidates = STATIONS.filter((s) => s.name !== from.name);
  if (difficulty === "kurz") {
    candidates = candidates.filter((s) => s.region === from.region);
  } else if (difficulty === "mittel") {
    candidates = candidates.filter((s) => s.region !== from.region);
  } else {
    candidates = candidates.filter((s) => areFarRegions(from.region, s.region));
  }

  // Falls die Region zu wenig Auswahl bietet (z.B. kleine Region bei "kurz"),
  // auf alle anderen Bahnhöfe ausweichen statt festzuhängen.
  if (candidates.length === 0) {
    candidates = STATIONS.filter((s) => s.name !== from.name);
  }

  const to = pickRandom(candidates);
  return { from, to };
}
