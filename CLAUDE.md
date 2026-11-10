# Hinweise für Claude

Dieses Repo ist das Langzeitgedächtnis für die Gemüsegarten-Planung von Andreas (Naturgarten Eberndorf, Kärnten). Jede neue Session beginnt ohne Vorwissen – alles Wichtige steht hier im Repo.

## Zu Beginn jeder Gemüsegarten-Session lesen

1. `Gemüsegarten/Grundlagen/Standort-und-Beete.md` – Standort, Boden, Beete, Fruchtfolge, Ressourcen
2. `Gemüsegarten/Grundlagen/Planungszyklus.md` – wie geplant und ausgewertet wird
3. `Gemüsegarten/Grundlagen/Erfahrungen.md` – bestätigte Erkenntnisse aus früheren Jahren
4. `Gemüsegarten/Grundlagen/Kulturwissen.md` – Steckbriefe aller Gemüsearten mit unseren Erfahrungen (erzeugt aus `kulturen.yaml`)
5. `Gemüsegarten/Grundlagen/Merkliste.md` – Erinnerungen; passende Punkte von sich aus ansprechen
6. `Gemüsegarten/Grundlagen/Naturgarten-bio.md` – Naturjahreszeiten, Gartenjahr, Mondgarten, Jahreskreis und Prinzipien von naturgarten.bio
7. Den Ordner des **Vorjahres** (Plan + `Rueckmeldung.md`) und ggf. den des aktuellen Jahres

## Arbeitsweise

- Auf Deutsch antworten (Du-Form), österreichische Gemüsenamen verwenden.
- Alle Dokumente als Markdown anlegen, keine Office-Formate.
- **Eine Datenquelle je Thema (SSOT), nichts doppelt pflegen:**
  - `Grundlagen/kulturen.yaml`: alles zu einer Gemüseart (Platz, Licht, Boden, Wurzel, Nährstoffe, Wasser, Frost, Termine/Naturjahreszeit, Nachbarn, Schädlinge, Küchenbedarf, Sorten, **Erfahrungen nach Jahr**)
  - `Grundlagen/familien.yaml`: Pflanzenfamilien mit Anbaupause
  - `Grundlagen/flaechen.yaml`: Beete und Tomatenhaus; `Grundlagen/standort.yaml`: Garten (Ort, Klima, Wasser, Anzucht)
  - `<Jahr>/plan.yaml`: was in einem Jahr wo geplant war und tatsächlich stand
  - `Kulturwissen.md` wird mit `npm run kulturwissen` erzeugt – nie von Hand bearbeiten. CI scheitert, wenn sie nicht aktuell ist.
- **Erfahrungsschatz:** Erfahrungen zu einer Art kommen als `{jahr, text, sicherheit}` unter `erfahrungen:` in `kulturen.yaml` (sicherheit: beobachtet | hypothese | bestaetigt – „bestaetigt“ erst, wenn es sich in mindestens zwei Jahren gezeigt hat). Erprobte Sorten unter `sorten:`. Weicht ein Faustwert bei uns dauerhaft ab, den Wert anpassen und das als Erfahrung notieren. `Erfahrungen.md` nur für Artübergreifendes (Boden, Wetter, Wasser, Planung).
- **Beetpläne sind Daten:** Der Plan eines Jahres steht in `Gemüsegarten/<Jahr>/plan.yaml` (Positionen, Zeiträume, Ist-Stand). Kulturwerte stehen in `Grundlagen/kulturen.yaml`, Flächenmaße in `Grundlagen/flaechen.yaml`. Die Anzeige übernimmt der Beetplaner (`index.html` + `beetplaner/`, GitHub Pages: https://apachler.github.io/pac-naturgarten-eberndorf/). Keine eigenen HTML- oder JSX-Beetpläne pro Jahr mehr bauen. Format: `beetplaner/README.md`.
- Nach jeder Änderung an Plan- oder Kulturdaten `npm ci && npm run pruefen && npm test` ausführen und Warnungen beheben oder begründen (`begruendung:` in der Pflanzung). Neue Kulturen zuerst in `kulturen.yaml` anlegen. Nach Änderungen am Beetplaner zusätzlich `npm run test:e2e` (Playwright, Chrome). Pages veröffentlicht nur bei grünen Tests.
- Das Design des Beetplaners folgt dem Design-System von naturgarten.bio (`docs/DESIGN.md` in `apachler/pacnaturgarten`): nur die Tokens, Cormorant Garamond/Open Sans, rounded-xl, Grün als einziger Akzent.
- Rückmeldungen auch in `plan.yaml` unter `ist:` nachtragen (Status, Anzahl, Ernte, Notiz).
- **Im Sinne von naturgarten.bio planen:** Termine zusätzlich als Naturjahreszeit mit Zeigerpflanze angeben (Eberndorf ca. 10 Tage vor dem DWD-Mittel), Prinzipien Bodenleben/No-Dig, Mischkultur, Regenwasser, Kreislauf und Biodiversität berücksichtigen, Mondgarten nur als optionale Feinabstimmung. Quelle ist das Repo `apachler/pacnaturgarten` (nur lesen, dort gelten eigene Regeln). Bei Änderungen dort `beetplaner/naturjahr.js` und `Grundlagen/Naturgarten-bio.md` nachziehen.
- Beim Planen aktiv auf Probleme hinweisen (Platz, Nachbarschaften, Fruchtfolge) und bei Konflikten begründet priorisieren, statt still wegzulassen.
- Pflanzpläne müssen 1:1 umsetzbar sein: jede Pflanze mit Position (X/Y in cm, Ursprung Südwest-Ecke) und alle gewünschten Stückzahlen vollständig. Auch Vor- und Nachkulturen möglichst als Punkte oder Reihen statt als Bereich. Die Prüfung kontrolliert Stückzahl, Abstand, Nachbarn, Platz, Frost und Fruchtfolge.
- Neue Jahre aus `Gemüsegarten/Vorlagen/` anlegen (inkl. `plan.yaml`) und in `Gemüsegarten/jahre.yaml` eintragen.
- **Regel für Rückmeldungen:** Zu jeder Jahres-Rückmeldung das Wetter des Jahres für Eberndorf/Kärnten recherchieren (GeoSphere Austria, BMLUK-Monatsberichte „Wasserhaushalt Österreich“ mit Grundwasser-Messstelle Eberndorf, Klimarückblick Kärnten) und als `<Jahr>/Wetter.md` nach `Vorlagen/Wetter.md` ablegen, mit Quellen.
- Erkenntnisse, die über ein Jahr hinaus gelten, nach `Grundlagen/Erfahrungen.md` bzw. `Kulturwissen.md` übernehmen und das Jahr als Quelle angeben. Jahresordner bleiben als Archiv unverändert, außer für Korrekturen.
- Die Jahresliste in `Gemüsegarten/README.md` aktuell halten.
- Am Ende einer Session eine kurze Zusammenfassung in die `README.md` des betroffenen Jahres schreiben.
