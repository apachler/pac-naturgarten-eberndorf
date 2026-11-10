#!/usr/bin/env node
// Prüft alle Jahrespläne. Aufruf: node beetplaner/pruefen.mjs [jahr]
// Exit-Code 1 nur bei Fehlern (Warnungen und Hinweise brechen nicht ab).

import { readFileSync, appendFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { pruefen } from './modell.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'Gemüsegarten');
const lade = (p) => yaml.load(readFileSync(join(root, p), 'utf8'));

const kulturen = lade('Grundlagen/kulturen.yaml');
const flaechen = lade('Grundlagen/flaechen.yaml');
const { jahre } = lade('jahre.yaml');
const plaene = jahre.map((j) => lade(j.plan));
const nurJahr = process.argv[2] ? Number(process.argv[2]) : null;

const symbol = { fehler: '❌', warnung: '⚠️ ', hinweis: 'ℹ️ ' };
let fehler = 0;
let summary = '# Prüfung der Beetpläne\n\n';

for (const plan of plaene) {
  if (nurJahr && plan.jahr !== nurJahr) continue;
  const m = pruefen({ plan, kulturen, flaechen, vorjahre: plaene });
  const z = (s) => m.filter((x) => x.stufe === s).length;
  fehler += z('fehler');
  console.log(`\n== ${plan.jahr}: ${z('fehler')} Fehler, ${z('warnung')} Warnungen, ${z('hinweis')} Hinweise ==`);
  summary += `## ${plan.jahr}: ${z('fehler')} Fehler, ${z('warnung')} Warnungen, ${z('hinweis')} Hinweise\n\n`;
  for (const x of m) {
    console.log(`${symbol[x.stufe]} [${x.thema}] ${x.text}`);
    summary += `- ${symbol[x.stufe].trim()} **${x.thema}:** ${x.text}\n`;
  }
  summary += '\n';
}

if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
process.exit(fehler ? 1 : 0);
