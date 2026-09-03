import { useState } from "react";
import {
  ApiError,
  getConnections,
  getStationboard,
  normalizeStationName,
  parseDurationToMinutes,
  type StationboardEntry,
  type StationLocation,
  type StopPoint,
} from "./api/opendata";
import { generateChallenge, type Challenge, type Difficulty } from "./game/challenge";
import type { Leg, Phase } from "./game/types";
import { DepartureBoard } from "./components/DepartureBoard";
import { StopPicker } from "./components/StopPicker";
import { JourneyLog } from "./components/JourneyLog";
import { ResultCard } from "./components/ResultCard";
import { StationSearchInput } from "./components/StationSearchInput";
import "./App.css";

const DIFFICULTIES: { key: Difficulty; label: string; hint: string }[] = [
  { key: "kurz", label: "Kurze Reise", hint: "gleiche Region" },
  { key: "mittel", label: "Mittlere Reise", hint: "andere Region" },
  { key: "lang", label: "Grosse Reise", hint: "quer durchs Land" },
];

function getAlightOptions(entry: StationboardEntry, currentStation: string): StopPoint[] {
  const list = entry.passList ?? [];
  const idx = list.findIndex(
    (p) => normalizeStationName(p.station.name) === normalizeStationName(currentStation),
  );
  const after = idx >= 0 ? list.slice(idx + 1) : list;
  return after.filter((p) => p.arrival);
}

function App() {
  const [phase, setPhase] = useState<Phase>("start");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentStation, setCurrentStation] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [board, setBoard] = useState<StationboardEntry[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<StationboardEntry | null>(null);
  const [legs, setLegs] = useState<Leg[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [optimalMinutes, setOptimalMinutes] = useState<number | null>(null);
  const [optimalTransfers, setOptimalTransfers] = useState<number | null>(null);
  const [customFrom, setCustomFrom] = useState<StationLocation | null>(null);
  const [customTo, setCustomTo] = useState<StationLocation | null>(null);

  async function beginChallenge(c: Challenge) {
    const now = new Date();
    setChallenge(c);
    setStartTime(now);
    setCurrentStation(c.from.name);
    setCurrentTime(now);
    setLegs([]);
    setSelectedJourney(null);
    setWarning(null);
    setErrorMessage(null);
    setOptimalMinutes(null);
    setOptimalTransfers(null);
    setPhase("loading-board");
    await loadBoard(c.from.name, now);
  }

  async function startChallenge(diff: Difficulty) {
    await beginChallenge(generateChallenge(diff));
  }

  const customStationsMatch =
    customFrom && customTo && normalizeStationName(customFrom.name) === normalizeStationName(customTo.name);

  async function startCustomChallenge() {
    if (!customFrom || !customTo || customStationsMatch) return;
    await beginChallenge({ from: customFrom, to: customTo });
    setCustomFrom(null);
    setCustomTo(null);
  }

  async function loadBoard(station: string, when: Date) {
    setPhase("loading-board");
    setSelectedJourney(null);
    try {
      const entries = await getStationboard(station, { datetime: when });
      setBoard(entries);
      setPhase("choosing-departure");
    } catch (e) {
      setErrorMessage(e instanceof ApiError ? e.message : "Unbekannter Fehler beim Laden der Abfahrtstafel.");
      setPhase("error");
    }
  }

  function handleSelectDeparture(entry: StationboardEntry) {
    const options = getAlightOptions(entry, currentStation);
    if (options.length === 0) {
      setWarning(
        `Für ${entry.category}${entry.number} liegen keine Halte-Details vor. Wähle bitte einen anderen Zug.`,
      );
      return;
    }
    setWarning(null);
    setSelectedJourney(entry);
    setPhase("choosing-stop");
  }

  async function handleSelectStop(stop: StopPoint) {
    if (!selectedJourney || !challenge) return;
    const departure = selectedJourney.stop.departure
      ? new Date(selectedJourney.stop.departure)
      : currentTime!;
    const arrival = stop.arrival ? new Date(stop.arrival) : departure;

    const leg: Leg = {
      journeyLabel: `${selectedJourney.category}${selectedJourney.number}`,
      fromStation: currentStation,
      toStation: stop.station.name,
      departure,
      arrival,
      platform: selectedJourney.stop.platform,
    };
    const newLegs = [...legs, leg];
    setLegs(newLegs);
    setCurrentStation(stop.station.name);
    setCurrentTime(arrival);

    const reachedDestination =
      normalizeStationName(stop.station.name) === normalizeStationName(challenge.to.name);

    if (reachedDestination) {
      setPhase("arrived");
      await loadOptimalComparison(challenge, startTime!);
    } else {
      await loadBoard(stop.station.name, arrival);
    }
  }

  async function loadOptimalComparison(c: Challenge, when: Date) {
    try {
      const connections = await getConnections(c.from.name, c.to.name, { when, limit: 1 });
      if (connections.length > 0) {
        setOptimalMinutes(parseDurationToMinutes(connections[0].duration));
        setOptimalTransfers(connections[0].transfers);
      }
    } catch {
      // Vergleichswert ist ein Bonus - falls er fehlschlägt, zeigt ResultCard nur die eigene Zeit.
      setOptimalMinutes(null);
      setOptimalTransfers(null);
    }
  }

  function reset() {
    setPhase("start");
    setChallenge(null);
  }

  const playerMinutes =
    startTime && currentTime ? Math.round((currentTime.getTime() - startTime.getTime()) / 60000) : 0;

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚆 Fahrplan-Detektiv</h1>
        <p className="subtitle">Reise mit echten SBB-Verbindungen quer durch die Schweiz</p>
      </header>

      {phase === "start" && (
        <div className="board start-screen">
          <h2>Neue Herausforderung</h2>
          <p className="hint">
            Wähle eine Schwierigkeit. Du bekommst einen Start- und Zielbahnhof und reist mit echten,
            aktuellen Zügen dorthin - Zug für Zug, so wie es auch wirklich fährt.
          </p>
          <div className="difficulty-picker">
            {DIFFICULTIES.map((d) => (
              <button key={d.key} className="primary" onClick={() => startChallenge(d.key)}>
                {d.label}
                <span className="hint">{d.hint}</span>
              </button>
            ))}
          </div>

          <div className="divider">oder eigene Strecke</div>

          <div className="custom-challenge">
            <StationSearchInput label="Start" value={customFrom} onChange={setCustomFrom} />
            <StationSearchInput label="Ziel" value={customTo} onChange={setCustomTo} />
            {customStationsMatch && (
              <p className="warning">Start und Ziel müssen unterschiedlich sein.</p>
            )}
            <button
              className="primary"
              disabled={!customFrom || !customTo || !!customStationsMatch}
              onClick={startCustomChallenge}
            >
              Los geht's
            </button>
          </div>
        </div>
      )}

      {phase !== "start" && challenge && (
        <div className="journey-header">
          <div>
            <strong>{challenge.from.name}</strong> → <strong>{challenge.to.name}</strong>
          </div>
          <div className="hint">
            Aktueller Standort: {currentStation}
            {currentTime && (
              <>
                {" "}
                um{" "}
                {currentTime.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })}
              </>
            )}
          </div>
          <JourneyLog legs={legs} />
          <button className="secondary" onClick={reset}>
            Aufgeben / neu starten
          </button>
        </div>
      )}

      {phase === "loading-board" && <p className="hint">Lade Abfahrtstafel…</p>}

      {phase === "choosing-departure" && (
        <>
          {warning && <p className="warning">{warning}</p>}
          <DepartureBoard station={currentStation} board={board} onSelect={handleSelectDeparture} />
        </>
      )}

      {phase === "choosing-stop" && selectedJourney && (
        <StopPicker
          journeyLabel={`${selectedJourney.category}${selectedJourney.number} nach ${selectedJourney.to}`}
          stops={getAlightOptions(selectedJourney, currentStation)}
          destinationHint={challenge?.to.name ?? ""}
          onSelect={handleSelectStop}
          onBack={() => setPhase("choosing-departure")}
        />
      )}

      {phase === "arrived" && challenge && (
        <ResultCard
          legs={legs}
          playerMinutes={playerMinutes}
          optimalMinutes={optimalMinutes}
          optimalTransfers={optimalTransfers}
          onRestart={reset}
        />
      )}

      {phase === "error" && (
        <div className="board">
          <p className="warning">{errorMessage}</p>
          <button className="primary" onClick={reset}>
            Neu starten
          </button>
        </div>
      )}

      <footer className="app-footer">
        Fahrplandaten: transport.opendata.ch (Community-API auf Basis offener SBB-Daten). Kein
        offizielles SBB-Produkt.
      </footer>
    </div>
  );
}

export default App;
