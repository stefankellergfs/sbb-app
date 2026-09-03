# Fahrplan-Detektiv

Eine kleine Browser-Spiel-App für Zug- und Fahrplan-Fans: Du bekommst einen
Start- und Zielbahnhof irgendwo in der Schweiz und reist dorthin mit echten,
aktuellen Zügen - Abfahrt für Abfahrt, so wie sie wirklich fahren. Am Ende
wird deine Route mit der schnellsten tatsächlichen Verbindung verglichen und
es gibt eine Punktzahl.

## Spielprinzip

1. Schwierigkeit wählen (kurze/mittlere/grosse Reise) - oder Start- und
   Zielbahnhof frei per Volltextsuche (über alle Schweizer Bahnhöfe) selbst
   wählen.
2. Die App zeigt die echte, aktuelle Abfahrtstafel deines Standorts.
3. Zug auswählen, Ausstiegsbahnhof wählen - die App aktualisiert Standort und
   Uhrzeit entsprechend den echten Fahrzeiten.
4. Wiederholen, bis das Ziel erreicht ist.
5. Vergleich mit der schnellsten echten Verbindung und Punktzahl.

## Datenquelle

Fahrplandaten kommen von [transport.opendata.ch](https://transport.opendata.ch/),
einer kostenlosen Community-API auf Basis offener SBB-/OpenTransportData-Daten.
Kein API-Key nötig, alle Aufrufe passieren direkt im Browser (`src/api/opendata.ts`).
Kein offizielles SBB-Produkt.

## Entwicklung

```bash
npm install
npm run dev      # Dev-Server mit Hot Reload
npm run lint      # oxlint
npm run build     # Typecheck + Produktions-Build
```

## Projektstruktur

- `src/api/opendata.ts` - Fetch-Wrapper und Typen für die Fahrplan-API
- `src/data/stations.ts` - kuratierte Liste Schweizer Bahnhöfe für Herausforderungen
- `src/game/` - Challenge-Generator, Punkteberechnung, Spielzustands-Typen
- `src/components/` - Abfahrtstafel, Bahnhof-Suche, Ausstiegswahl, Routen-Log, Ergebnis-Karte
- `src/App.tsx` - Spielablauf/State-Machine
