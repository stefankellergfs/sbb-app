import type { StationboardEntry } from "../api/opendata";

interface Props {
  station: string;
  board: StationboardEntry[];
  onSelect: (entry: StationboardEntry) => void;
}

function formatTime(iso: string | null): string {
  if (!iso) return "--:--";
  const d = new Date(iso);
  return d.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });
}

export function DepartureBoard({ station, board, onSelect }: Props) {
  return (
    <div className="board">
      <h3>Abfahrten in {station}</h3>
      {board.length === 0 && <p className="hint">Keine Abfahrten gefunden.</p>}
      <ul className="board-list">
        {board.map((entry, i) => {
          const delay = entry.stop.delay;
          return (
            <li key={i}>
              <button className="board-row" onClick={() => onSelect(entry)}>
                <span className="badge">
                  {entry.category}
                  {entry.number}
                </span>
                <span className="time">
                  {formatTime(entry.stop.departure)}
                  {delay ? <span className="delay"> +{delay}'</span> : null}
                </span>
                <span className="destination">nach {entry.to}</span>
                <span className="platform">
                  {entry.stop.platform ? `Gleis ${entry.stop.platform}` : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
