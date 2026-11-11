# Ausbauplan

Ideen für Beetplaner und Werkzeuge, angeregt durch die Web-App [Kraut und Rüben](https://dianakunz.github.io/kraut-und-rueben/)
(Diana Kunz). Entschieden mit Andreas im Q&A am 11.11.2026.

Das Repo von Kraut und Rüben hat **keine Lizenz**. Wir übernehmen deshalb nur Ideen, keinen Code und keine Texte.
Alles wird passend zu unserem Aufbau umgesetzt: YAML als einzige Datenquelle, der Beetplaner zeigt nur an, erfasst
wird mit Claude Code (`/rueckmeldung`, `/jahresplanung`, `/saison-notiz`).

## Reihenfolge

1. **Jetzt:** A2 Wetterrückblick
2. **Vor `/jahresplanung` 2027:** E4 Gründüngung, E2 Pflanzenschutz, C2 Einkaufsliste (erledigt)
3. **Vor der Saison 2027 (bis März):** A1 Wetterwarnungen, D1 Diese Woche, D2 Folgesaat, D3 Notiz vom Handy, F1 Offline (erledigt)
4. **Danach:** B3 Sortensterne, E1 Unterschiedliche Angaben, E3 Jauchen und Brühen, E5 Küche, B2 Jahresbericht

## Beschlossen

| Nr. | Idee | Umfang | Stand |
|---|---|---|---|
| A2 | Wetterrückblick | `npm run wetter -- <Jahr>` schreibt Messwerte für Eberndorf mit Abweichung vom Klimamittel 1991–2020 in `<Jahr>/Wetter.md`. Die Einordnung (Kärnten, Grundwasser) bleibt Recherche. | erledigt |
| E4 | Gründüngung im Ruhebeet | Rolle `G` mit Feld `gruenduengung`; Phacelia, Buchweizen (abfrierend), Inkarnatklee, Zottelwicke (winterhart) in `kulturen.yaml`; Tabelle in `Kulturwissen.md`; `/jahresplanung` wägt ab, ob und wo sie im Ruhebeet passen. No-Dig: abfrieren lassen oder abmähen und als Mulch liegen lassen, nicht einarbeiten. | erledigt |
| E2 | Pflanzenschutz | eigene `Grundlagen/schaedlinge.yaml`: erkennen, vorbeugen, naturgemäß handeln, Erfahrungen nach Jahr, verknüpft mit den Arten; Anzeige im Detailblatt und in `Kulturwissen.md`. Zuerst Wühlmaus, Raupen an Paprika, Schnecken, Bohnenlaus. | erledigt |
| C2 | Einkaufsliste | aus `plan.yaml`: Jungpflanzen mit Stückzahl und Kaufzeitpunkt (Naturjahreszeit), Saatgut für die Direktsaat; als Tab im Beetplaner und mit `npm run einkauf -- <Jahr>` in `/jahresplanung`; `bezug:` je Pflanzung. Ohne Saatgutvorrat. | erledigt |
| A1 | Wetterwarnungen | Vorhersage für Eberndorf im Beetplaner (Open-Meteo, 7 Tage; GeoSphere sagt nur 61 Stunden voraus): Frost, Bodenfrost unter 4 °C, Hitze ab 30 °C, Trockenphase, mit Bezug auf die Kulturen, die gerade im Beet stehen. | erledigt |
| D1 | Diese Woche im Garten | Startkarte: was laut Plan ansteht, Naturjahreszeit, passende Merklisten-Punkte, Wetterwarnung. | erledigt |
| D2 | Folgesaat | Feld `folgesaat` in `kulturen.yaml`; der Beetplaner zeigt „Zeit zum Nachsäen“ ab dem Ist-Datum. | erledigt |
| D3 | Notiz vom Handy | Knopf im Beetplaner öffnet ein vorausgefülltes GitHub-Issue „Saisonnotiz …“ (ohne Token); Claude arbeitet es mit `/saison-notiz` ein. | erledigt |
| F1 | Offline am Handy | Service Worker (zuerst Netz, ohne Netz der gespeicherte Stand). | erledigt |
| B3 | Sortensterne | `bewertung: 1–5` bei `sorten` in `kulturen.yaml`, beste Sorten zuerst. | offen |
| E1 | Unterschiedliche Angaben | wo Quellen sich widersprechen (Abstand, Termine, Nachbarn), steht das mit Quelle bei der Art. | offen |
| E3 | Jauchen und Brühen | Brennnessel, Beinwell, Schachtelhalm mit Termin als Naturjahreszeit. | offen |
| E5 | Küche und Haltbarmachen | Küchenbedarf (`bedarf`) mit der Ernte verknüpfen, eigene Rezepte. | offen |
| B2 | Jahresbericht | Druckansicht oder PDF: Plan, Ist, Ernte, Wetter, Saisontagebuch auf wenigen Seiten. | offen |

## Bewusst nicht

- **B1 Ernte in Mengen:** Die Bewertung `+`/`o`/`++` bleibt, weil sie wenig Aufwand macht.
- **C1 Saatgutvorrat mit Keimprobe**, **A3 Wasser-Ampel**, **A4 Wetterband im Kalender**, **F2 Gartenkarte**, **F3 Illustrationen**.
- **Daten im Browser mit Sync über ein GitHub-Token:** Bei uns ist Git die Datenquelle.
