export interface ScoreResult {
  score: number;
  minutesLost: number;
  extraTransfers: number;
}

const MINUTE_PENALTY = 2;
const TRANSFER_PENALTY = 10;

export function computeScore(
  playerMinutes: number,
  playerTransfers: number,
  optimalMinutes: number,
  optimalTransfers: number,
): ScoreResult {
  const minutesLost = Math.max(0, playerMinutes - optimalMinutes);
  const extraTransfers = Math.max(0, playerTransfers - optimalTransfers);
  const score = Math.max(
    0,
    Math.min(100, 100 - minutesLost * MINUTE_PENALTY - extraTransfers * TRANSFER_PENALTY),
  );
  return { score, minutesLost, extraTransfers };
}

export function scoreLabel(score: number): string {
  if (score >= 95) return "Fahrplan-Meister!";
  if (score >= 80) return "Sehr gut gereist!";
  if (score >= 60) return "Solide Reise!";
  if (score >= 35) return "Ans Ziel gekommen!";
  return "Das war ein Umweg…";
}
