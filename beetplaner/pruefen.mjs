#!/usr/bin/env node
// Prüft alle Jahrespläne. Aufruf: node beetplaner/pruefen.mjs [jahr]
// Exit-Code 1 nur bei Fehlern (Warnungen und Hinweise brechen nicht ab).

import { readFileSync, appendFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { pruefen, validiereKulturen, hatIstStand } from './modell.js';
import { NATURJAHRESZEITEN } from './naturjahr.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'Gemüsegarten');
const lade = (p) => yaml.load(readFileSync(join(root, p), 'utf8'));

const kulturen = lade('Grundlagen/kulturen.yaml');
const flaechen = lade('Grundlagen/flaechen.yaml');
const familien = lade('Grundlagen/familien.yaml');
const { jahre } = lade('jahre.yaml');
const plaene = jahre.map((j) => lade(j.plan));
const nurJahr = process.argv[2] ? Number(process.argv[2]) : null;

const symbol = { fehler: '❌', warnung: '⚠️ ', hinweis: 'ℹ️ ' };
let fehler = 0;
let summary = '# Prüfung der Beetpläne\n\n';

const kulturFehler = validiereKulturen(kulturen, familien, NATURJAHRESZEITEN.map((s) => s.id));
console.log(`\n== Kulturdaten: ${kulturFehler.length} Fehler ==`);
for (const f of kulturFehler) console.log(`❌ [Kulturen] ${f}`);
summary += `## Kulturdaten: ${kulturFehler.length} Fehler\n\n${kulturFehler.map((f) => `- ❌ ${f}`).join('\n')}\n\n`;
fehler += kulturFehler.length;

for (const plan of plaene) {
  if (nurJahr && plan.jahr !== nurJahr) continue;
  for (const ist of hatIstStand(plan) ? [false, true] : [false]) {
    const m = pruefen({ plan, kulturen, flaechen, familien, vorjahre: plaene, ist });
    const z = (s) => m.filter((x) => x.stufe === s).length;
    fehler += z('fehler');
    const titel = `${plan.jahr}${ist ? ' – Ist-Stand' : hatIstStand(plan) ? ' – Plan' : ''}: ${z('fehler')} Fehler, ${z('warnung')} Warnungen, ${z('hinweis')} Hinweise`;
    console.log(`\n== ${titel} ==`);
    summary += `## ${titel}\n\n`;
    for (const x of m) {
      console.log(`${symbol[x.stufe]} [${x.thema}] ${x.text}`);
      summary += `- ${symbol[x.stufe].trim()} **${x.thema}:** ${x.text}\n`;
    }
    summary += '\n';
  }
}

if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
process.exit(fehler ? 1 : 0);
