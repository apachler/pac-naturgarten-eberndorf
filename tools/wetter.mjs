#!/usr/bin/env node
// Wetterrückblick für Eberndorf aus den SPARTACUS-Tageswerten von GeoSphere Austria (1-km-Raster, ab 1961).
//   npm run wetter -- 2026            → Abschnitt „Messwerte Eberndorf“ in Gemüsegarten/2026/Wetter.md einsetzen
//   npm run wetter -- 2026 --anzeigen → nur ausgeben, nichts schreiben
//   npm run wetter -- --klimamittel   → Gemüsegarten/Grundlagen/klima.yaml (Mittel 1991–2020) neu erzeugen
// Ort aus Grundlagen/standort.yaml (lat/lon). Die Rechenlogik steht in beetplaner/wetter.js.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { tageAusGeosphere, klimamittel, wetterMarkdown, einsetzen } from '../beetplaner/wetter.js';

const API = 'https://dataset.api.hub.geosphere.at/v1/timeseries/historical/spartacus-v2-1d-1km';
const KLIMA_VON = 1991, KLIMA_BIS = 2020;
const garten = join(dirname(fileURLToPath(import.meta.url)), '..', 'Gemüsegarten');
const standort = yaml.load(readFileSync(join(garten, 'Grundlagen', 'standort.yaml'), 'utf8'));
const klimaDatei = join(garten, 'Grundlagen', 'klima.yaml');

async function holen(url) {
  for (let versuch = 1; ; versuch++) {
    try {
      const r = await fetch(url);
      if (r.ok) return await r.json();
      throw new Error(`GeoSphere antwortet mit ${r.status}: ${(await r.text()).slice(0, 200)}`);
    } catch (e) {
      if (versuch >= 4) throw e;
      await new Promise((ok) => setTimeout(ok, 2000 * 2 ** (versuch - 1)));
    }
  }
}

async function tage(von, bis) {
  const meta = await holen(`${API}/metadata`);
  const letzter = meta.end_time.slice(0, 10);
  const ende = bis < letzter ? bis : letzter;
  if (ende < von) throw new Error(`Für ${von} gibt es noch keine Daten (GeoSphere hat Daten bis ${letzter}).`);
  const url = `${API}?parameters=TN,TX,RR,SA&start=${von}T00:00&end=${ende}T00:00&lat_lon=${standort.lat},${standort.lon}`;
  return tageAusGeosphere(await holen(url));
}

async function klimaErzeugen() {
  const t = await tage(`${KLIMA_VON}-01-01`, `${KLIMA_BIS}-12-31`);
  const k = klimamittel(t, KLIMA_VON, KLIMA_BIS);
  const kopf = `# Klimamittel ${k.zeitraum} für unseren Garten – ERZEUGT mit \`npm run wetter -- --klimamittel\`, nicht von Hand ändern.
# Quelle: GeoSphere Austria, SPARTACUS v2 (Tageswerte im 1-km-Raster, CC BY 4.0), Rasterpunkt aus standort.yaml.
# Werte je Monat sind Mittel über die Jahre: tm/tn/tx °C (tm = Mittel aus Minimum und Maximum), rr Niederschlag mm,
# sonne Stunden, Kenntage als Anzahl (Frost: Minimum < 0 °C, Eis: Maximum < 0 °C, Sommer: Maximum ≥ 25 °C,
# Hitze: Maximum ≥ 30 °C, Regen: ≥ 1 mm, Starkregen: ≥ 20 mm).
# Termine als MM-TT: letzter Frost (Jänner–Juni), letzte Nacht unter 4 °C, erster Frost (ab Juli).
`;
  const daten = { quelle: 'GeoSphere Austria, SPARTACUS v2 1d 1km', lat: standort.lat, lon: standort.lon, ...k };
  writeFileSync(klimaDatei, kopf + yaml.dump(daten, { lineWidth: 120, flowLevel: 2 }));
  console.log(`Klimamittel ${k.zeitraum} geschrieben: ${klimaDatei}`);
}

async function jahrAuswerten(jahr, anzeigen) {
  if (!existsSync(klimaDatei)) throw new Error('Grundlagen/klima.yaml fehlt – zuerst `npm run wetter -- --klimamittel` ausführen.');
  const klima = yaml.load(readFileSync(klimaDatei, 'utf8'));
  const t = await tage(`${jahr}-01-01`, `${jahr}-12-31`);
  const markdown = wetterMarkdown({ jahr, tage: t, klima, ort: standort });
  if (anzeigen) { console.log(markdown); return; }
  const datei = join(garten, String(jahr), 'Wetter.md');
  const alt = existsSync(datei)
    ? readFileSync(datei, 'utf8')
    : readFileSync(join(garten, 'Vorlagen', 'Wetter.md'), 'utf8').replaceAll('<JAHR>', jahr);
  writeFileSync(datei, einsetzen(alt, { jahr, markdown }));
  console.log(`Messwerte ${jahr} eingesetzt: ${datei} (Daten bis ${t.at(-1).datum})`);
}

const args = process.argv.slice(2);
try {
  if (args.includes('--klimamittel')) await klimaErzeugen();
  else {
    const jahr = Number(args.find((a) => /^\d{4}$/.test(a)));
    if (!jahr) { console.error('Aufruf: npm run wetter -- <Jahr> [--anzeigen] | --klimamittel'); process.exit(1); }
    await jahrAuswerten(jahr, args.includes('--anzeigen'));
  }
} catch (e) {
  console.error(`Wetter: ${e.message}`);
  process.exit(1);
}
