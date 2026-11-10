# Planungszyklus

So läuft ein Gartenjahr im Repo ab, hier am Beispiel 2026 → 2027.

## 1. Rückmeldung zum Vorjahr (Winter, z. B. Dezember 2026)

- `Vorlagen/Rueckmeldung.md` liegt bereits als `2026/Rueckmeldung.md` im Jahresordner und wird ausgefüllt.
- Inhalte: tatsächlich gepflanzte Mengen, Ernte gut/schlecht, Platzprobleme, Krankheiten und Schädlinge, Wetter, Arbeitsaufwand, was gefehlt hat oder zu viel war.
- Stichworte reichen – Claude strukturiert sie in die Vorlage.
- **Regel:** Zu jeder Rückmeldung recherchiert Claude das Wetter des Jahres für Eberndorf bzw. Kärnten und legt eine Zusammenfassung als `<Jahr>/Wetter.md` ab (Vorlage `Vorlagen/Wetter.md`). Darin werden die Daten mit unseren Beobachtungen abgeglichen und Folgerungen für die Planung des nächsten Jahres gezogen.

## 2. Erkenntnisse sichern

- Was über das Jahr hinaus gilt (z. B. „Gurken brauchen mehr Platz als geplant“, „Kohlweißling-Druck hoch“), kommt nach `Grundlagen/Erfahrungen.md`, mit Jahr als Quelle.
- Bestätigte Abstände und Termine werden in `Grundlagen/Kulturwissen.md` angepasst.

## 3. Wünsche für das neue Jahr (Winter)

- Neuer Ordner `2027/` aus den Vorlagen anlegen.
- `2027/Planungsauftrag.md` ausfüllen: gewünschte Kulturen und Stückzahlen, Sorten, Änderungen bei Boden, Wasser oder Beeten, besondere Wetterbeobachtungen.

## 4. Planung (Winter, spätestens Februar)

Eingaben:
- Plan und Rückmeldung des Vorjahres
- `Grundlagen/` (Standort, Fruchtfolge, Erfahrungen, Kulturwissen)
- Planungsauftrag des neuen Jahres

Ergebnisse im Jahresordner:
- `Beetplanung.md` mit Problemanalyse, Pflanzenliste, Zonen, Pflanzkalender, exaktem Positionsplan und Pflegetipps
- `Beetplan.html` als interaktiver Beetplan für den Browser
- `README.md` mit Zusammenfassung und Entscheidungen

Fruchtfolge beachten: Das aktive Beet wechselt. Auf das Beet, das im Vorjahr geruht hat, kommen die Kulturen. Starkzehrer, Kohlgewächse und Familien aus dem letzten Anbau auf diesem Beet (zwei Jahre zuvor) berücksichtigen.

## 5. Saison (März bis November)

- Die Punkte der `Grundlagen/Merkliste.md` für die Saison im Blick behalten.
- Abweichungen vom Plan und Beobachtungen laufend in `<Jahr>/Notizen.md` festhalten (optional, erleichtert die Rückmeldung).
- Danach beginnt der Zyklus mit Schritt 1 von vorn.
