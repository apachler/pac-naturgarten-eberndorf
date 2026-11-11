#!/usr/bin/env node
// Einkaufsliste eines Jahres als Markdown – dieselbe Logik wie der Tab „Einkauf“ im Beetplaner.
//   npm run einkauf -- 2027
// Bezug je Pflanzung: `bezug:` im Plan (jungpflanze | saatgut | steckgut | vorhanden), sonst aus `anbau` in kulturen.yaml.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { einkaufsliste, saatmengeFuer, formatDatum } from '../beetplaner/modell.js';
import { saisonAm } from '../beetplaner/naturjahr.js';

const garten = join(dirname(fileURLToPath(import.meta.url)), '..', 'Gemüsegarten');
const lade = (p) => yaml.load(readFileSync(join(garten, p), 'utf8'));
const jahr = Number(process.argv.slice(2).find((a) => /^\d{4}$/.test(a)));
if (!jahr) { console.error('Aufruf: npm run einkauf -- <Jahr>'); process.exit(1); }
const eintrag = lade('jahre.yaml').jahre.find((j) => j.jahr === jahr);
if (!eintrag) { console.error(`${jahr} steht nicht in Gemüsegarten/jahre.yaml.`); process.exit(1); }

const kulturen = lade('Grundlagen/kulturen.yaml');
const flaechen = lade('Grundlagen/flaechen.yaml');
const standort = lade('Grundlagen/standort.yaml');
const e = einkaufsliste(lade(eintrag.plan), kulturen);
const TITEL = { jungpflanze: 'Jungpflanzen kaufen', saatgut: 'Saatgut', steckgut: 'Steckzwiebeln, Zehen, Knollen' };
const WANN = { jungpflanze: 'Pflanzen ab', saatgut: 'Säen ab', steckgut: 'Stecken ab' };

const z = [`# Einkaufsliste ${jahr}`, '', `Aus \`${eintrag.plan}\`. Termin = frühester Saat- bzw. Pflanztermin mit Naturjahreszeit in Eberndorf.`];
for (const b of ['jungpflanze', 'saatgut', 'steckgut']) {
  if (!e[b].length) continue;
  z.push('', `## ${TITEL[b]} (${e[b].length})`, '', `| Kultur | Sorte | Menge | Fläche | ${WANN[b]} |`, '|---|---|---|---|---|');
  for (const x of e[b]) {
    const k = kulturen[x.kultur];
    const gramm = k.gruenduengung ? saatmengeFuer(k.gruenduengung.saatmenge, x.m2) : null;
    const menge = gramm ? `${String(Math.round(x.m2 * 10) / 10).replace('.', ',')} m² · ${gramm}` : x.ohneZahl && !x.anzahl ? 'offen' : `${x.anzahl}${x.ohneZahl ? '+' : ''} Stk.`;
    const s = x.ab ? saisonAm(x.ab, standort) : null;
    const wann = x.ab ? `${formatDatum(x.ab)} (${s.name})` : '–';
    const name = `${k.name}${x.unsicher ? ' ⚠️ Bezug offen' : ''}`;
    z.push(`| ${name} | ${(x.sorte || '').replace(/\|/g, '/')} | ${menge} | ${x.flaechen.map((f) => flaechen[f]?.name || f).join(', ')} | ${wann} |`);
  }
}
if (Object.values(e).some((l) => l.some((x) => x.unsicher))) {
  z.push('', '⚠️ Bezug offen: Die Kultur kennt mehrere Wege (z. B. Jungpflanze oder Direktsaat) – in der Pflanzung mit `bezug:` festlegen.');
}
console.log(z.join('\n'));
