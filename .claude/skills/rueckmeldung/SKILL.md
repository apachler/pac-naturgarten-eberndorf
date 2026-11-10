---
name: rueckmeldung
description: Rückmeldung zu einem Gartenjahr aufnehmen und auswerten – Ist-Stand in plan.yaml, Erfahrungen und Sorten je Art in kulturen.yaml, Wetter des Jahres für Eberndorf recherchieren (Wetter.md), artübergreifende Erkenntnisse, Merkliste. Verwenden, wenn Andreas erzählt, wie ein Gartenjahr gelaufen ist, oder im Herbst/Winter die Auswertung ansteht.
---

# Rückmeldung zu einem Gartenjahr

Jahr = das ausgewertete Jahr (meist das laufende, im Herbst/Winter).

1. **Lesen:** Leseliste aus `CLAUDE.md`, dazu `Gemüsegarten/<Jahr>/plan.yaml`, `README.md`, ggf. vorhandene `Rueckmeldung.md`,
   und `Gemüsegarten/Vorlagen/Rueckmeldung.md` als Gliederung.
2. **Nachfragen, was fehlt** – je Pflanzung: wirklich gepflanzt? Wo (falls anders als geplant)? Wie viele? Ernte (++/+/o/−)?
   Probleme (Schädlinge, Krankheiten, Schossen, Trockenheit)? Sorten und Bezugsquelle? Dazu Gesamteindruck, Wasser,
   Arbeitsaufwand, was 2027 anders sein soll. Nicht alles auf einmal fragen; was Andreas später nachliefern will, in die Merkliste.
3. **Ist-Stand in `plan.yaml`** unter `ist:` je Pflanzung (`status`, `anzahl`, `ernte`, `notiz`, abweichende Lage als eigene
   `punkte`/`reihen`/`bereich`). Den geplanten Teil nicht verändern.
4. **`Rueckmeldung.md`** im Jahresordner nach der Vorlage schreiben (Andreas' Aussagen, nicht ausschmücken).
5. **Wetter recherchieren** (Pflicht-Regel): GeoSphere Austria (Klimamonitoring, Jahres-/Monatsrückblick), BMLUK
   „Wasserhaushalt Österreich“ (Grundwasser-Messstelle Eberndorf), Klimarückblick Kärnten. Als `<Jahr>/Wetter.md` nach
   `Vorlagen/Wetter.md`, mit Quellenliste und Bezug zu den Beobachtungen im Beet (Hitze, Trockenheit, Spätfrost).
6. **Erfahrungsschatz:** je Art in `kulturen.yaml` unter `erfahrungen:` `{ jahr, text, sicherheit }` ergänzen
   (`beobachtet`/`hypothese`; `bestaetigt` nur, wenn sich dasselbe schon in einem früheren Jahr gezeigt hat – dann den alten
   Eintrag stehen lassen und den neuen als bestätigt markieren). Sorten unter `sorten:` mit `ergebnis`. Dauerhaft abweichende
   Faustwerte anpassen. Artübergreifendes nach `Grundlagen/Erfahrungen.md` (Jahr als Quelle).
7. **Merkliste** pflegen: Erledigtes streichen, neue Erinnerungen (Fotos, Nachlieferungen, Ideen fürs nächste Jahr).
8. **Prüfen:** `npm run pruefen && npm test` (der Hook erzeugt `Kulturwissen.md` schon neu). Im Beetplaner „Ist-Stand“ ansehen.
9. **Abschluss:** Kurzzusammenfassung in `Gemüsegarten/<Jahr>/README.md`; Commit „Rückmeldung <Jahr>: …“ ohne Attribution.
