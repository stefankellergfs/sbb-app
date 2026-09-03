import type { StopPoint } from "../api/opendata";

interface Props {
  journeyLabel: string;
  stops: StopPoint[];
  destinationHint: string;
  onSelect: (stop: StopPoint) => void;
  onBack: () => void;
}

function formatTime(iso: string | null): string {
  if (!iso) return "--:--";
  const d = new Date(iso);
  return d.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });
}

export function StopPicker({ journeyLabel, stops, destinationHint, onSelect, onBack }: Props) {
  return (
    <div className="board">
      <h3>{journeyLabel} - wo steigst du aus?</h3>
      <p className="hint">Ziel deiner Reise: {destinationHint}</p>
      <ul className="board-list">
        {stops.map((stop, i) => (
          <li key={i}>
            <button className="board-row" onClick={() => onSelect(stop)}>
              <span className="time">{formatTime(stop.arrival)}</span>
              <span className="destination">{stop.station.name}</span>
              <span className="platform">
                {stop.platform ? `Gleis ${stop.platform}` : ""}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <button className="secondary" onClick={onBack}>
        Zurück zur Abfahrtstafel
      </button>
    </div>
  );
}
