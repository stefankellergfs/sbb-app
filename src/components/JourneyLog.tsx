import type { Leg } from "../game/types";

function formatTime(d: Date): string {
  return d.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });
}

export function JourneyLog({ legs }: { legs: Leg[] }) {
  if (legs.length === 0) return null;
  return (
    <ol className="journey-log">
      {legs.map((leg, i) => (
        <li key={i}>
          <strong>{leg.journeyLabel}</strong>: {leg.fromStation} ({formatTime(leg.departure)}) →{" "}
          {leg.toStation} ({formatTime(leg.arrival)})
        </li>
      ))}
    </ol>
  );
}
