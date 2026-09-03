import { useEffect, useId, useRef, useState } from "react";
import { searchStations, type StationLocation } from "../api/opendata";

interface Props {
  label: string;
  placeholder?: string;
  value: StationLocation | null;
  onChange: (station: StationLocation | null) => void;
}

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;
const MAX_RESULTS = 8;

export function StationSearchInput({ label, placeholder, value, onChange }: Props) {
  const [query, setQuery] = useState(value?.name ?? "");
  const [results, setResults] = useState<StationLocation[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlighted, setHighlighted] = useState(0);
  const requestId = useRef(0);
  const inputId = useId();

  useEffect(() => {
    if (value && query === value.name) {
      setResults([]);
      setOpen(false);
      return;
    }
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      searchStations(trimmed)
        .then((stations) => {
          if (id !== requestId.current) return;
          setResults(stations.slice(0, MAX_RESULTS));
          setHighlighted(0);
          setOpen(true);
        })
        .catch(() => {
          if (id !== requestId.current) return;
          setError("Suche fehlgeschlagen.");
          setResults([]);
        })
        .finally(() => {
          if (id === requestId.current) setLoading(false);
        });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function handleInputChange(next: string) {
    setQuery(next);
    if (value) onChange(null);
  }

  function pick(station: StationLocation) {
    onChange(station);
    setQuery(station.name);
    setResults([]);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(results[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="station-search">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        type="text"
        autoComplete="off"
        value={query}
        placeholder={placeholder ?? "Bahnhof eingeben…"}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {loading && <span className="hint search-status">suche…</span>}
      {error && <span className="warning search-status">{error}</span>}
      {open && results.length > 0 && (
        <ul className="search-results">
          {results.map((s, i) => (
            <li key={s.id ?? s.name}>
              <button
                type="button"
                className={i === highlighted ? "active" : undefined}
                onMouseDown={() => pick(s)}
                onMouseEnter={() => setHighlighted(i)}
              >
                {s.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
