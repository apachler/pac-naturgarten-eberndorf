#!/usr/bin/env node
// Erzeugt Gemüsegarten/Grundlagen/Kulturwissen.md aus kulturen.yaml und familien.yaml.
//   node beetplaner/kulturwissen.mjs          → Datei schreiben
//   node beetplaner/kulturwissen.mjs --check  → Exit 1, wenn die Datei nicht aktuell ist (CI)

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { validiereKulturen, schlechteNachbarnVon } from './modell.js';
import { NATURJAHRESZEITEN, naturjahr } from './naturjahr.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'Gemüsegarten', 'Grundlagen');
const lade = (p) => yaml.load(readFileSync(join(root, p), 'utf8'));
const kulturen = lade('kulturen.yaml');
const familien = lade('familien.yaml');
const standort = lade('standort.yaml');
const ziel = join(root, 'Kulturwissen.md');

const fehler = validiereKulturen(kulturen, familien, NATURJAHRESZEITEN.map((s) => s.id));
if (fehler.length) {
  console.error('kulturen.yaml ist nicht gültig:\n- ' + fehler.join('\n- '));
  process.exit(1);
}

const ROLLE = { V: 'Vorkultur', H: 'Hauptkultur', N: 'Nachkultur', B: 'Beikraut' };
const SICHER = { beobachtet: 'beobachtet', bestaetigt: '**bestätigt**', hypothese: '*Hypothese*' };
const MONATE = ['Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
// Jahresunabhängiger Beginn in Eberndorf (Bezugsjahr ohne Schalttag)
const nj = Object.fromEntries(naturjahr(2027, standort).map((s) => [s.id, s]));
const saisonText = (id) => {
  const s = nj[id];
  return `${s.name} (${s.zeiger}; in Eberndorf ab ca. ${s.beginn.getUTCDate()}. ${MONATE[s.beginn.getUTCMonth()]})`;
};
const namen = (ids) => (ids || []).map((i) => kulturen[i]?.name || i).sort((a, b) => a.localeCompare(b, 'de')).join(', ');
const zelle = (s) => String(s ?? '').replace(/\|/g, '/');
const reihenfolge = Object.keys(familien);
const nachFamilie = (a, b) => reihenfolge.indexOf(kulturen[a].familie) - reihenfolge.indexOf(kulturen[b].familie) || kulturen[a].name.localeCompare(kulturen[b].name, 'de');
const ids = Object.keys(kulturen).sort(nachFamilie);

const z = [];
z.push('# Kulturwissen');
z.push('');
z.push('> **Erzeugt aus [`kulturen.yaml`](kulturen.yaml) und [`familien.yaml`](familien.yaml) – nicht von Hand bearbeiten.**');
z.push('> Änderungen und neue Erfahrungen gehören in die YAML-Dateien, danach `npm run kulturwissen`. CI prüft, ob diese Datei aktuell ist.');
z.push('');
z.push('Die Steckbriefe sind unser Erfahrungsschatz: Allgemeine Werte sind Faustwerte aus der gängigen Gartenpraxis für Kärnten. Was wir selbst beobachten, steht je Art unter **Erfahrungen**, mit Jahr und Sicherheit (beobachtet → bestätigt ab zwei Jahren, oder Hypothese). Eigene Erfahrungen gehen vor.');
z.push('');
z.push('## Grundregeln');
z.push('');
z.push('- Frostempfindliche Kulturen erst **nach den Eisheiligen** ins Freie; Jungpflanzen bis dahin im ehemaligen Heizraum zwischenlagern *(2026)*.');
z.push('- Hohe Kulturen (Feuerbohnen, Kohlsprossen, Gurken am Gitter) nach Norden.');
z.push('- Vor- und Nachkulturen teilen sich die Fläche zeitlich versetzt mit den Hauptkulturen – der Beetplaner prüft, ob der Platz rechtzeitig frei ist.');
z.push('- Fruchtfolge: dieselbe Pflanzenfamilie erst nach ihrer Anbaupause wieder an dieselbe Stelle (Tabelle unten). Die Prüfung im Beetplaner rechnet mit der tatsächlichen Lage früherer Jahre.');
z.push('');
z.push('## Pflanzenfamilien und Anbaupausen');
z.push('');
z.push('| Familie | Botanisch | Anbaupause | Grund | Kulturen |');
z.push('|---------|-----------|------------|-------|----------|');
for (const [fam, f] of Object.entries(familien)) {
  const k = ids.filter((i) => kulturen[i].familie === fam).map((i) => kulturen[i].name).join(', ');
  z.push(`| ${fam} | *${f.botanisch}* | ${f.anbaupause} ${f.anbaupause === 1 ? 'Jahr' : 'Jahre'} | ${zelle(f.grund)}${f.hinweis ? ` ${zelle(f.hinweis)}` : ''} | ${k} |`);
}
z.push('');
z.push('## Übersicht');
z.push('');
z.push('| Kultur | Familie | Rolle | Abstand | Licht | Wasser | Nährstoffe | Start | Ernte | Erfahrungen |');
z.push('|--------|---------|-------|---------|-------|--------|------------|-------|-------|-------------|');
for (const id of ids) {
  const k = kulturen[id];
  const anker = k.name.toLowerCase().replace(/[^a-zäöüß0-9]+/g, '-');
  z.push(`| [${k.name}](#${anker}) | ${k.familie} | ${k.rollen.join(' ')} | ${k.abstand}${k.reihe ? ` × ${k.reihe}` : ''} cm | ${zelle(k.licht)} | ${k.wasser} | ${k.zehrer} | ${nj[k.naturjahreszeit].name}${k.frost ? ' ❄' : ''} | ${zelle(k.ernte)} | ${(k.erfahrungen || []).length} |`);
}
z.push('');
z.push('Rolle: V Vorkultur · H Hauptkultur · N Nachkultur · B Beikraut. Start = Naturjahreszeit für Aussaat bzw. Pflanzung. ❄ = frostempfindlich.');
z.push('');
z.push('## Steckbriefe');
let familie = null;
for (const id of ids) {
  const k = kulturen[id];
  if (k.familie !== familie) {
    familie = k.familie;
    z.push('');
    z.push(`### ${familie}`);
  }
  const f = familien[k.familie];
  z.push('');
  z.push(`#### ${k.name}`);
  z.push('');
  z.push(`*${k.botanisch}* · ${k.familie} (Anbaupause ${f.anbaupause} ${f.anbaupause === 1 ? 'Jahr' : 'Jahre'}) · ${k.rollen.map((r) => ROLLE[r]).join(', ')} · ID \`${id}\``);
  z.push('');
  z.push(`- **Platz:** ${k.abstand} cm in der Reihe${k.reihe ? `, Reihenabstand ${k.reihe} cm` : ''}, Höhe ca. ${k.hoehe} cm`);
  z.push(`- **Standort:** ${k.licht}; Boden ${k.boden}; Wurzel ${k.wurzel}`);
  z.push(`- **Bedarf:** Nährstoffe ${k.zehrer}${k.zehrer === 'stark' ? ' (Starkzehrer)' : k.zehrer === 'schwach' ? ' (Schwachzehrer)' : ''}, Wasser ${k.wasser}${k.frost ? ', **frostempfindlich**' : ''}`);
  z.push(`- **Anbau:** ${k.anbau}${k.aussaat ? `; Aussaat ${k.aussaat}` : ''}${k.pflanzung ? `; Pflanzung ${k.pflanzung}` : ''}`);
  z.push(`- **Wann:** ${saisonText(k.naturjahreszeit)}`);
  z.push(`- **Ernte:** ${k.ernte}`);
  if (k.gut?.length) z.push(`- **Gute Nachbarn:** ${namen(k.gut)}`);
  const schlecht = schlechteNachbarnVon(id, kulturen);
  if (schlecht.length) z.push(`- **Schlechte Nachbarn:** ${namen(schlecht)}`);
  if (k.schaedlinge?.length) z.push(`- **Schädlinge:** ${k.schaedlinge.join(', ')}`);
  if (k.krankheiten?.length) z.push(`- **Krankheiten:** ${k.krankheiten.join(', ')}`);
  if (k.bedarf) z.push(`- **Küche:** ${k.bedarf}`);
  if (k.hinweis) z.push(`- **Hinweis:** ${k.hinweis}`);
  if (k.sorten?.length) {
    z.push('');
    z.push('| Sorte | Bezug | Jahr | Ergebnis |');
    z.push('|-------|-------|------|----------|');
    for (const s of k.sorten) z.push(`| ${zelle(s.name)} | ${zelle(s.quelle)} | ${s.jahr} | ${zelle(s.ergebnis)} |`);
  }
  z.push('');
  if (k.erfahrungen?.length) {
    z.push('**Erfahrungen:**');
    z.push('');
    for (const e of [...k.erfahrungen].sort((a, b) => b.jahr - a.jahr)) z.push(`- ${e.jahr} · ${SICHER[e.sicherheit] || e.sicherheit || 'beobachtet'}: ${e.text}`);
  } else {
    z.push('*Noch keine eigenen Erfahrungen.*');
  }
}
z.push('');
const inhalt = z.join('\n');

if (process.argv.includes('--check')) {
  const alt = readFileSync(ziel, 'utf8');
  if (alt !== inhalt) {
    console.error('Kulturwissen.md ist nicht aktuell – `npm run kulturwissen` ausführen und committen.');
    process.exit(1);
  }
  console.log('Kulturwissen.md ist aktuell.');
} else {
  writeFileSync(ziel, inhalt);
  console.log(`Kulturwissen.md geschrieben (${ids.length} Kulturen, ${Object.keys(familien).length} Familien).`);
}
