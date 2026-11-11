---
paths:
  - "Gemüsegarten/**"
---

# Gartendaten bearbeiten

- **Erfahrungen** zu einer Art als `{ jahr, text, sicherheit }` unter `erfahrungen:` in `kulturen.yaml`.
  `sicherheit`: `beobachtet` (einmal gesehen) | `hypothese` (Vermutung zur Ursache) | `bestaetigt` (erst, wenn es sich in
  mindestens zwei Jahren gezeigt hat). Bestehende Einträge nicht umschreiben – ein späteres Jahr ergänzt oder bestätigt.
- Erprobte Sorten unter `sorten:` mit `{ name, quelle, jahr, ergebnis }`. Unbekannte Namen offen als unbekannt notieren.
- **Gründüngung** ist eine Kultur mit Rolle `G` und Feld `gruenduengung: { winter, saatmenge, ende, wirkung }`.
  Keine Kreuzblütler-Gründüngung (Senf, Ölrettich) – sie zählen wie Kohl.
- **Pflanzenschutz:** ausführliche Steckbriefe in `Grundlagen/schaedlinge.yaml` (`betrifft:` mit Kultur-IDs, `erkennen`,
  `vorbeugen`, `handeln`, `erfahrungen`, `quellen`); die Namen in `kulturen.yaml` (`schaedlinge`/`krankheiten`) bleiben die
  kurze Liste. Naturgemäß: vorbeugen und Nützlinge zuerst, Mittel nur gezielt.
- **Bezug** einer Pflanzung für die Einkaufsliste: `bezug: jungpflanze | saatgut | steckgut | vorhanden` in `plan.yaml`,
  nötig, wenn `anbau` der Kultur mehrere Wege nennt („Jungpflanze oder Direktsaat“).
- Weicht ein Faustwert (Abstand, Termin, Bedarf) bei uns dauerhaft ab: Wert anpassen **und** als Erfahrung notieren.
- `Erfahrungen.md` nur für Artübergreifendes (Boden, Wetter, Wasser, Planung, Anzucht).
- `Kulturwissen.md` nie von Hand ändern – der Hook bzw. `npm run kulturwissen` erzeugt sie.
- In `plan.yaml`: Koordinaten in cm, Ursprung Südwest-Ecke. Abweichungen der Wirklichkeit unter `ist:`
  (`status`: geplant | gepflanzt | im_beet | geerntet | nicht_gepflanzt | unbekannt, `anzahl`, `ernte`, `notiz`, `von`/`bis` für tatsächliche Termine, ggf. eigene
  `punkte`/`reihen`/`bereich` für die tatsächliche Lage). Wich die Einteilung eines Beets ab, unter
  `flaechen.<id>.ist:` eigene `zonen`/`wege` eintragen. Den Plan selbst nach der Saison nicht umschreiben.
- Warnungen der Prüfung beheben oder mit `begruendung:` in der Pflanzung erklären.
- **Wetter-Regel:** Zu jeder Jahres-Rückmeldung zuerst `npm run wetter -- <Jahr>` ausführen (Messwerte Eberndorf aus dem
  GeoSphere-Raster, erzeugter Abschnitt zwischen `<!-- wetter:start -->` und `<!-- wetter:ende -->` – nie von Hand ändern;
  `Grundlagen/klima.yaml` ist ebenfalls erzeugt). Dann das Wetter des Jahres für Eberndorf/Kärnten recherchieren (GeoSphere Austria
  Klimamonitoring/Klimarückblick, BMLUK-Monatsberichte „Wasserhaushalt Österreich“ mit Grundwasser-Messstelle Eberndorf,
  Klimarückblick Kärnten) und als `<Jahr>/Wetter.md` nach `Vorlagen/Wetter.md` mit Quellen ablegen.
- Fotos oder Beobachtungen, um die Andreas gebeten hat, in die Merkliste aufnehmen und zur passenden Zeit ansprechen.
  Merklisten-Punkte mit einem Zeitraum im Titel versehen, z. B. `**Ollas eingraben (April–Mai 2027):**` – dann zeigt der
  Beetplaner sie unter „Diese Woche im Garten“.
- **Folgesaat:** `folgesaat: { alle: <Wochen>, monate: [..] }` in `kulturen.yaml` für Kulturen, die in Sätzen gesät werden.
- Neue Jahre nur aus `Gemüsegarten/Vorlagen/` anlegen und in `jahre.yaml` sowie `Gemüsegarten/README.md` eintragen.
