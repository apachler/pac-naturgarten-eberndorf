#!/usr/bin/env node
// PostToolUse-Hook für Claude Code: Nach jeder Änderung an Daten unter Gemüsegarten/
//   - kulturen.yaml oder familien.yaml → Kulturwissen.md neu erzeugen
//   - irgendeine YAML-Datei             → Pläne und Kulturdaten prüfen
// Findet die Prüfung Fehler, meldet der Hook sie an Claude zurück (Exit 2), damit sie sofort behoben werden.
// Warnungen bremsen nicht – sie erscheinen in `npm run pruefen` und im Beetplaner.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

let eingabe = {};
try {
  eingabe = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0);
}
const datei = eingabe.tool_input?.file_path || eingabe.tool_input?.path || '';
if (!/Gemüsegarten\/.*\.ya?ml$/.test(datei)) process.exit(0);

const repo = process.env.CLAUDE_PROJECT_DIR || process.cwd();
if (!existsSync(join(repo, 'node_modules', 'js-yaml'))) {
  console.error('Hinweis: node_modules fehlt – `npm ci` ausführen, dann prüft der Hook Kulturdaten und Pläne automatisch.');
  process.exit(0);
}
const node = (skript, ...args) => execFileSync(process.execPath, [join(repo, 'beetplaner', skript), ...args], { cwd: repo, encoding: 'utf8', stdio: 'pipe' });

try {
  if (/Grundlagen\/(kulturen|familien|standort)\.yaml$/.test(datei)) node('kulturwissen.mjs');
  node('pruefen.mjs');
} catch (e) {
  const aus = `${e.stdout || ''}${e.stderr || ''}`.split('\n').filter((z) => /❌|nicht gültig|^- |Fehler/.test(z)).slice(0, 30).join('\n');
  console.error(`Die Prüfung nach der Änderung an ${datei.split('Gemüsegarten/')[1]} hat Fehler gefunden:\n${aus || e.message}`);
  process.exit(2);
}
process.exit(0);
