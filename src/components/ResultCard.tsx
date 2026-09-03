import type { Leg } from "../game/types";
import { computeScore, scoreLabel } from "../game/scoring";
import { JourneyLog } from "./JourneyLog";

interface Props {
  legs: Leg[];
  playerMinutes: number;
  optimalMinutes: number | null;
  optimalTransfers: number | null;
  onRestart: () => void;
}

export function ResultCard({
  legs,
  playerMinutes,
  optimalMinutes,
  optimalTransfers,
  onRestart,
}: Props) {
  const playerTransfers = Math.max(0, legs.length - 1);
  const hasReference = optimalMinutes !== null && optimalTransfers !== null;
  const result = hasReference
    ? computeScore(playerMinutes, playerTransfers, optimalMinutes!, optimalTransfers!)
    : null;

  return (
    <div className="board result">
      <h3>Angekommen!</h3>
      <p className="hint">
        Deine Reisezeit: <strong>{playerMinutes} Min.</strong> mit{" "}
        <strong>{playerTransfers} Umstieg{playerTransfers === 1 ? "" : "e"}</strong>
      </p>
      {hasReference ? (
        <>
          <p className="hint">
            Schnellste echte Verbindung: <strong>{optimalMinutes} Min.</strong> mit{" "}
            <strong>
              {optimalTransfers} Umstieg{optimalTransfers === 1 ? "" : "e"}
            </strong>
          </p>
          <p className="score">
            {result!.score} / 100 Punkte - {scoreLabel(result!.score)}
          </p>
        </>
      ) : (
        <p className="hint">
          (Konnte die optimale Vergleichsverbindung gerade nicht laden.)
        </p>
      )}
      <h4>Deine Route</h4>
      <JourneyLog legs={legs} />
      <button className="primary" onClick={onRestart}>
        Neue Herausforderung
      </button>
    </div>
  );
}
