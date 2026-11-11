// Browser-Tests für den Beetplaner. Aufruf: npm run test:e2e
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { positionen, pruefen, ort, einkaufsliste } from '../../beetplaner/modell.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'Gemüsegarten');
const lade = (p) => yaml.load(readFileSync(join(root, p), 'utf8'));
const kulturen = lade('Grundlagen/kulturen.yaml');
const flaechen = lade('Grundlagen/flaechen.yaml');
const plaene = lade('jahre.yaml').jahre.map((j) => lade(j.plan));

/** Seite öffnen und auf die fertige Darstellung warten; Konsolenfehler sammeln. */
/** Vorhersage wie von Open-Meteo: 7 Tage zurück, 7 voraus; einzelne Tage überschreibbar. */
function wetterAntwort(heute, anders = {}) {
  const time = [], tn = [], tx = [], rr = [];
  for (let i = -7; i < 7; i++) {
    const d = new Date(Date.UTC(heute.getFullYear(), heute.getMonth(), heute.getDate() + i)).toISOString().slice(0, 10);
    const w = { tn: 8, tx: 20, rr: 2, ...(anders[d] || {}) };
    time.push(d); tn.push(w.tn); tx.push(w.tx); rr.push(w.rr);
  }
  return { daily: { time, temperature_2m_min: tn, temperature_2m_max: tx, precipitation_sum: rr } };
}

async function wetterSimulieren(page, heute = new Date(), anders = {}) {
  await page.route('**/api.open-meteo.com/**', (r) => r.fulfill({ json: wetterAntwort(heute, anders) }));
}

async function oeffne(page, hash = '#2026/west', { wetter = true } = {}) {
  if (wetter) await wetterSimulieren(page);
  const fehler = [];
  page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
  page.on('pageerror', (e) => fehler.push(String(e)));
  await page.goto(`/index.html${hash}`);
  await expect(page.locator('#beet .beet-rand')).toBeVisible();
  return fehler;
}

/** Zeitregler auf die Woche stellen, in der `iso` liegt (der Regler läuft in Wochen ab Montag). */
async function setzeDatum(page, iso) {
  await page.evaluate((iso) => {
    const r = document.querySelector('#datum');
    const jahr = Number(document.querySelector('#jahr').value);
    const jan1 = new Date(Date.UTC(jahr, 0, 1));
    const start = Date.UTC(jahr, 0, 1 - ((jan1.getUTCDay() + 6) % 7));
    r.value = String(Math.floor((Date.parse(`${iso}T00:00:00Z`) - start) / 864e5 / 7));
    r.dispatchEvent(new Event('input'));
  }, iso);
}

/** SVG-Koordinate → cm im Beet, rein aus der Geometrie des Beet-Rechtecks. */
async function geometrie(page) {
  return page.evaluate(() => {
    const bed = document.querySelector('#beet .beet-rand');
    const bx = +bed.getAttribute('x'), by = +bed.getAttribute('y'), bh = +bed.getAttribute('height');
    const kreise = [...document.querySelectorAll('#beet circle.pflanze')].map((c) => ({
      id: c.dataset.id, dx: +c.dataset.x, dy: +c.dataset.y,
      x: +c.getAttribute('cx') - bx, y: by + bh - +c.getAttribute('cy'),
    }));
    const bereiche = [...document.querySelectorAll('#beet g.bereich')].map((g) => {
      const r = g.querySelector('rect.flaeche');
      return { id: g.dataset.id, x: +r.getAttribute('x') - bx, y: by + bh - (+r.getAttribute('y') + +r.getAttribute('height')), b: +r.getAttribute('width'), t: +r.getAttribute('height') };
    });
    return { kreise, bereiche, breite: +bed.getAttribute('width'), laenge: bh };
  });
}

test('lädt ohne Fehler, mit Schriften und Titel', async ({ page }) => {
  const fehler = await oeffne(page);
  await expect(page.locator('h1')).toHaveText('Beet West');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('#kicker')).toContainText('2026');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('700 16px cormorantgaramond'))).toBe(true);
  expect(await page.evaluate(() => document.fonts.check('400 16px "open sans"'))).toBe(true);
  expect(fehler).toEqual([]);
});

for (const plan of plaene) {
  for (const fid of [...new Set(plan.pflanzungen.map((p) => p.flaeche))]) {
    test(`${plan.jahr}/${fid}: jede Pflanze steht an ihrer geplanten Position`, async ({ page }) => {
      await oeffne(page, `#${plan.jahr}/${fid}`);
      await page.locator('#opt-alle').check();
      const g = await geometrie(page);
      const f = flaechen[fid];
      expect(g.breite).toBe(f.breite);
      expect(g.laenge).toBe(f.laenge);
      for (const p of plan.pflanzungen.filter((q) => q.flaeche === fid)) {
        const soll = positionen(p);
        if (soll.length) {
          const ist = g.kreise.filter((k) => k.id === p.id);
          expect(ist.length, `${p.id}: Anzahl Kreise`).toBe(soll.length);
          const key = (a) => `${Math.round(a.x * 100)}|${Math.round(a.y * 100)}`;
          expect(ist.map(key).sort(), `${p.id}: Position aus der Geometrie`).toEqual(soll.map(key).sort());
          expect(ist.map((k) => key({ x: k.dx, y: k.dy })).sort(), `${p.id}: data-Attribute`).toEqual(soll.map(key).sort());
          if (!p.ausserhalb) for (const k of ist) expect(k.x >= 0 && k.x <= f.breite && k.y >= 0 && k.y <= f.laenge, `${p.id} im Beet`).toBe(true);
        } else if (p.bereich) {
          const ganz = p.bereich.b * p.bereich.t >= 0.9 * f.breite * f.laenge;
          if (ganz) {
            await expect(page.locator('#verteilt')).toContainText(kulturen[p.kultur].name);
          } else {
            const r = g.bereiche.find((b) => b.id === p.id);
            expect(r, `${p.id}: Bereich gezeichnet`).toBeTruthy();
            // Der Bereich wird mit 2 cm Innenabstand gezeichnet
            expect(Math.round(r.x - 2)).toBe(p.bereich.x);
            expect(Math.round(r.y - 2)).toBe(p.bereich.y);
            expect(Math.round(r.b + 4)).toBe(p.bereich.b);
            expect(Math.round(r.t + 4)).toBe(p.bereich.t);
          }
        }
      }
    });
  }
}

test('Norden ist oben, Westen links', async ({ page }) => {
  await oeffne(page);
  await page.locator('#opt-alle').check();
  const cy = async (id) => Number(await page.locator(`#beet circle.pflanze[data-id="${id}"]`).first().getAttribute('cy'));
  const cx = async (id, n) => Number(await page.locator(`#beet circle.pflanze[data-id="${id}"]`).nth(n).getAttribute('cx'));
  expect(await cy('feuerbohne')).toBeLessThan(await cy('rote_ruebe')); // Bohnen im Norden (y 450) über Rüben (y 70)
  expect(await cx('feuerbohne', 0)).toBeLessThan(await cx('feuerbohne', 4)); // Stange 1 (x 30) links von Stange 5 (x 270)
});

test('Zeitregler zeigt nur, was zum Datum im Beet steht, und die Naturjahreszeit', async ({ page }) => {
  await oeffne(page);
  expect(await page.locator('#datum').getAttribute('step')).toBe('1');
  expect(Number(await page.locator('#datum').getAttribute('max'))).toBeLessThan(70); // Wochen, nicht Tage
  await setzeDatum(page, '2026-06-17');
  await expect(page.locator('#datum-text')).toHaveText('15.–21. Juni 2026 · KW 25');
  await expect(page.locator('#saison')).toContainText('Hochsommer');
  await expect(page.locator('#beet g.pflanzung[data-id="paprika"]')).toHaveCount(1);
  await expect(page.locator('#beet g.pflanzung[data-id="radieschen"], #beet g.bereich[data-id="radieschen"]')).toHaveCount(0);
  await expect(page.locator('#legende')).toContainText('Paprika');
  await expect(page.locator('#gartenjahr')).toContainText('Unser Beet');
  await setzeDatum(page, '2026-03-05');
  await expect(page.locator('#saison')).toContainText('Vorfrühling');
  await expect(page.locator('#beet g.pflanzung[data-id="paprika"]')).toHaveCount(0);
  await expect(page.locator('#beet g.bereich[data-id="radieschen"]')).toHaveCount(1);
  await expect(page.locator('#datum-text')).toHaveText('2.–8. März 2026 · KW 10');
  await setzeDatum(page, '2026-06-30');
  await expect(page.locator('#datum-text')).toHaveText('29. Juni – 5. Juli 2026 · KW 27');
  await page.locator('#heute').click();
  await expect(page.locator('#datum-text')).not.toHaveText('29. Juni – 5. Juli 2026 · KW 27');
});

test('Detailblatt öffnet sich und schließt per Knopf, Escape und Hintergrund', async ({ page }) => {
  await oeffne(page);
  await setzeDatum(page, '2026-06-15');
  const blatt = page.locator('#blatt-huelle');
  const paprika = page.locator('#beet circle.pflanze[data-id="paprika"]').first();
  await paprika.click({ force: true });
  await expect(blatt).toBeVisible();
  await expect(page.locator('#blatt-titel')).toHaveText('Paprika');
  await expect(page.locator('#blatt-inhalt')).toContainText('Ist-Stand');
  await page.locator('#blatt-zu').click();
  await expect(blatt).toBeHidden();
  await paprika.click({ force: true });
  await expect(blatt).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(blatt).toBeHidden();
  await page.locator('#legende li').first().click();
  await expect(blatt).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(blatt).toBeHidden();
});

test('Tabs: Kalender und Liste zeigen alle Pflanzungen der Fläche', async ({ page }) => {
  await oeffne(page);
  const anzahl = plaene.find((p) => p.jahr === 2026).pflanzungen.filter((p) => p.flaeche === 'west').length;
  await page.getByRole('tab', { name: 'Kalender' }).click();
  await expect(page.getByRole('tab', { name: 'Kalender' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#tab-kalender')).toBeVisible();
  await expect(page.locator('#gantt .g-zeile:not(.g-kopf)')).toHaveCount(anzahl);
  await expect(page.locator('#gantt .g-saison').first()).toBeVisible();
  await page.getByRole('tab', { name: 'Liste' }).click();
  await expect(page.locator('#liste tbody tr')).toHaveCount(anzahl);
  await page.locator('#liste tbody tr').first().click();
  await expect(page.locator('#blatt-huelle')).toBeVisible();
});

test('Prüfung listet dieselben Meldungen wie das Prüf-Script und springt zum Plan', async ({ page }) => {
  await oeffne(page);
  const plan = plaene.find((p) => p.jahr === 2026);
  const erwartet = pruefen({ plan, kulturen, flaechen, vorjahre: plaene });
  await page.getByRole('tab', { name: /Prüfung/ }).click();
  await expect(page.locator('#pruefung .meldung')).toHaveCount(erwartet.length);
  await expect(page.locator('#pruef-zahl')).toHaveText(String(erwartet.filter((m) => m.stufe !== 'hinweis').length));
  await page.locator('#pruefung .meldung.warnung', { hasText: 'Kohlsprossen untereinander' }).click();
  await expect(page.locator('#tab-plan')).toBeVisible();
  await expect(page.locator('#beet g.pflanzung.markiert[data-id="kohlsprossen"]')).toHaveCount(1);
});

test('Ist-Stand, Vorjahr und Flächenwahl', async ({ page }) => {
  await oeffne(page);
  await page.locator('#opt-alle').check();
  await page.locator('#opt-ist').check();
  await expect(page.locator('#beet g.pflanzung.nicht[data-id="beinwell"]')).toHaveCount(1);
  await expect(page.locator('#beet g.pflanzung[data-id="beinwell"] text.symbol').first()).toHaveText('✕');
  await page.getByRole('tab', { name: /Beet Ost/ }).click();
  await expect(page.locator('h1')).toHaveText('Beet Ost');
  await expect(page).toHaveURL(/#2026\/ost$/);
  await expect(page.locator('#kicker')).toContainText('Ruhejahr');
  await page.locator('#opt-vorjahr').check();
  await expect(page.locator('#beet .vorjahr')).toContainText('2025: Flower Sprouts');
  await page.getByRole('tab', { name: 'Tomatenhaus' }).click();
  await expect(page.locator('h1')).toHaveText('Tomatenhaus');
});

test('Ist-Stand zeigt die tatsächliche Lage 2026', async ({ page }) => {
  await oeffne(page);
  const plan = plaene.find((p) => p.jahr === 2026);
  await page.locator('#opt-alle').check();
  await expect(page.locator('#verteilt .hinweis-ist')).toBeVisible();
  await page.locator('#verteilt .link-knopf').click();
  await expect(page.locator('#opt-ist')).toBeChecked();
  const g = await geometrie(page);
  for (const p of plan.pflanzungen.filter((q) => q.flaeche === 'west' && q.ist && (q.ist.punkte || q.ist.bereich))) {
    const o = ort(p, true);
    if (o.bereich) {
      const r = g.bereiche.find((b) => b.id === p.id);
      expect(r, `${p.id}: Ist-Bereich`).toBeTruthy();
      expect([Math.round(r.x - 2), Math.round(r.y - 2), Math.round(r.b + 4), Math.round(r.t + 4)], p.id).toEqual([o.bereich.x, o.bereich.y, o.bereich.b, o.bereich.t]);
    } else {
      const key = (a) => `${Math.round(a.x)}|${Math.round(a.y)}`;
      expect(g.kreise.filter((k) => k.id === p.id).map(key).sort(), p.id).toEqual(positionen(o).map(key).sort());
    }
  }
  // Feuerbohnen standen am Nordrand (Y 490), geplant waren Y 450
  expect(g.kreise.filter((k) => k.id === 'feuerbohne').every((k) => Math.round(k.y) === 490)).toBe(true);
  await page.locator('#beet text.bereich-text[data-id="winterlauch"]').click();
  await expect(page.locator('#blatt-inhalt')).toContainText('X 0–150 · Y 0–80 cm');  // Tatsächliche Einteilung: Zone A schmaler, die Pfade liegen anders als geplant
  await page.keyboard.press('Escape');
  const lagen = () => page.locator('#beet rect.weg').evaluateAll((r) => r.map((e) => Number(e.getAttribute('y'))));
  const zonenHoehen = () => page.locator('#beet rect.zone').evaluateAll((r) => r.map((e) => Math.round(Number(e.getAttribute('height')))));
  const istWege = await lagen();
  const istZonen = await zonenHoehen();
  await page.locator('#opt-ist').uncheck();
  const planWege = await lagen();
  const planZonen = await zonenHoehen();
  expect(istWege.length).toBe(2);
  expect(istWege, 'tatsächliche Pfade liegen anders als geplant').not.toEqual(planWege);
  expect(istZonen[0], 'Zone A tatsächlich schmaler').toBeLessThan(planZonen[0]);
});

test('Ist-Stand: nicht Gepflanztes ausgeblendet, „steht im Beet“ bleibt sichtbar', async ({ page }) => {
  await oeffne(page);
  await page.locator('#opt-ist').check();
  await setzeDatum(page, '2026-11-10');
  await expect(page.locator('#beet g.pflanzung[data-id="beinwell"]')).toHaveCount(0);
  await expect(page.locator('#beet g.bereich[data-id="wirsing"]')).toHaveCount(0);
  await expect(page.locator('#beet g.bereich[data-id="rote_ruebe"]')).toHaveCount(1); // Plan bis Ende Oktober, laut Rückmeldung noch im Beet
  await expect(page.locator('#beet g.pflanzung[data-id="mangold"]')).toHaveCount(1);
  await expect(page.locator('#beet g.pflanzung[data-id="paprika"]')).toHaveCount(0); // abgeerntet
  // Chinakohl und Endivie teilen sich die Fläche – Beschriftungen dürfen sich nicht überdecken
  const y = async (id) => Number(await page.locator(`#beet text.bereich-text[data-id="${id}"]`).getAttribute('y'));
  expect(Math.abs((await y('chinakohl')) - (await y('endivie')))).toBeGreaterThanOrEqual(12);
});

test('Über die Fläche: allgemeine Infos, Anbauhistorie und offene Fragen', async ({ page }) => {
  await oeffne(page);
  const info = page.locator('#flaechen-details');
  await expect(info.locator('summary')).toHaveText('Über das Beet');
  await info.locator('summary').click();
  await expect(info).toContainText('Heubeet');
  await expect(info).toContainText('Terra Preta');
  await expect(info).toContainText('Nord–Süd');
  await expect(info).toContainText('2026: bepflanzt');
  await expect(info).toContainText('Eberndorf');
  await page.getByRole('tab', { name: /Beet Ost/ }).click();
  await expect(page.locator('#flaechen-details')).toContainText('2025: bepflanzt – Kreuzblütler');
  await expect(page.locator('#flaechen-details')).toContainText('2026: Ruhejahr');
  await page.getByRole('tab', { name: 'Tomatenhaus' }).click();
  await expect(page.locator('#flaechen-details summary')).toHaveText('Über das Tomatenhaus');
  await expect(page.locator('#flaechen-details ul.offen li').first()).toBeAttached();
});

test('Detailblatt zeigt Steckbrief und Erfahrungen aus der Kultur-Datenquelle', async ({ page }) => {
  await oeffne(page);
  await setzeDatum(page, '2026-06-17');
  await page.locator('#beet circle.pflanze[data-id="feuerbohne"]').first().click({ force: true });
  const b = page.locator('#blatt-inhalt');
  await expect(b).toContainText('Phaseolus coccineus');
  await expect(b).toContainText('Anbaupause 3 Jahre');
  await expect(b).toContainText('Unsere Erfahrungen');
  await expect(b).toContainText('2026 · Hypothese');
  await expect(b).toContainText('Knoblauch'); // schlechter Nachbar, auch aus Sicht des Knoblauchs
  await expect(b.locator('a[href*="Kulturwissen.md#feuerbohne"]')).toBeAttached();
});

test('Jahr wechseln und Direktlink', async ({ page }) => {
  await oeffne(page, '#2026/tomatenhaus');
  await expect(page.locator('h1')).toHaveText('Tomatenhaus');
  await page.locator('#jahr').selectOption('2025');
  await expect(page.locator('h1')).toHaveText('Beet Ost');
  await expect(page).toHaveURL(/#2025\/ost$/);
});

test('kein waagrechtes Scrollen', async ({ page }) => {
  await oeffne(page);
  for (const tab of ['Plan', 'Kalender', 'Liste', 'Einkauf', 'Prüfung']) {
    await page.getByRole('tab', { name: new RegExp(tab) }).click();
    const [sw, cw, zuBreit] = await page.evaluate(() => {
      const w = document.documentElement.clientWidth;
      // Elemente, die über den Rand ragen – außer in eigenen Scroll-Containern
      const inScroller = (e) => { for (let p = e.parentElement; p; p = p.parentElement) if (['auto', 'scroll'].includes(getComputedStyle(p).overflowX)) return true; return false; };
      const raus = [...document.querySelectorAll('body *')].filter((e) => e.offsetParent !== null && e.getBoundingClientRect().right > w + 0.5 && !inScroller(e)).map((e) => `${e.tagName}.${e.className}`);
      return [document.documentElement.scrollWidth, w, raus.slice(0, 5)];
    });
    expect(sw, tab).toBeLessThanOrEqual(cw);
    expect(zuBreit, `${tab}: Elemente ragen über den Rand`).toEqual([]);
  }
});

test('verständliche Meldung, wenn Daten fehlen', async ({ page }) => {
  await page.route('**/jahre.yaml', (r) => r.fulfill({ status: 404, body: 'nope' }));
  await page.goto('/index.html');
  await expect(page.locator('.fehler-box')).toContainText('nicht geladen');
});

test('Prüfung: Plan und Ist-Stand umschaltbar', async ({ page }) => {
  await oeffne(page);
  await page.locator('[data-tab="pruefung"]').click();
  const box = page.locator('#pruefung');
  await expect(box.locator('.pruef-ansicht')).toContainText('Plan, wie er damals war');
  await expect(box).toContainText('Flower Sprouts');
  await box.locator('.pruef-ansicht .link-knopf').click();
  await expect(box.locator('.pruef-ansicht')).toContainText('tatsächliche Stand');
  await expect(box).not.toContainText('Flower Sprouts');
  await expect(box).toContainText('Kohlsprossen untereinander');
  await expect(page.locator('#opt-ist')).toBeChecked();
  await box.locator('.pruef-ansicht .link-knopf').click();
  await expect(page.locator('#opt-ist')).not.toBeChecked();
});

test('Einkauf: Jungpflanzen, Saatgut und Steckgut aus dem Plan über alle Flächen', async ({ page }) => {
  await oeffne(page);
  const e = einkaufsliste(plaene.find((p) => p.jahr === 2026), kulturen);
  await page.getByRole('tab', { name: 'Einkauf' }).click();
  await expect(page.locator('#tab-einkauf')).toBeVisible();
  await expect(page.locator('#einkauf tbody tr')).toHaveCount(e.jungpflanze.length + e.saatgut.length + e.steckgut.length);
  await expect(page.locator('#einkauf h2').first()).toHaveText(`Jungpflanzen kaufen (${e.jungpflanze.length})`);
  const tomate = page.locator('#einkauf tr[data-kultur="tomate"]');
  await expect(tomate).toContainText('8 Stk.');
  await expect(tomate).toContainText('Tomatenhaus');
  await expect(tomate).toContainText('15. Mai');
  await expect(page.locator('#einkauf tr[data-kultur="kohlrabi"]')).toContainText('im Plan mit „bezug:“ festlegen');
});

test('Detailblatt zeigt Pflanzenschutz-Steckbriefe der Kultur', async ({ page }) => {
  await oeffne(page);
  await setzeDatum(page, '2026-06-17');
  await page.locator('#beet circle.pflanze[data-id="paprika"]').first().click({ force: true });
  const b = page.locator('#blatt-inhalt');
  await expect(b).toContainText('Pflanzenschutz');
  const raupe = b.locator('details[data-schaedling="raupen_paprika"]');
  await expect(raupe).toContainText('nicht bestimmt');
  await raupe.locator('summary').click();
  await expect(raupe).toContainText('Helicoverpa armigera');
  await expect(raupe).toContainText('Unsere Erfahrungen');
  await expect(b.locator('a[href*="Kulturwissen.md#paprika"]')).toBeAttached();
});

test('Diese Woche im Garten: Säen, Pflanzen, Nachsäen und Wetterwarnung', async ({ page }) => {
  const heute = new Date('2026-05-11T08:00:00');
  await page.clock.setFixedTime(heute);
  await wetterSimulieren(page, heute, { '2026-05-13': { tn: -1.2 } });
  await oeffne(page, '#2026/west', { wetter: false });
  const w = page.locator('#woche');
  await expect(w.locator('h2')).toHaveText('Diese Woche im Garten');
  await expect(w.locator('li[data-art="pflanzen"]')).toContainText('Tomate');
  await expect(w.locator('li[data-art="pflanzen"]')).toContainText('Tomatenhaus');
  await expect(w.locator('li[data-art="saen"]')).toContainText('Feuerbohne');
  await expect(w.locator('li[data-art="folgesaat"]')).toContainText('Dill');
  const frost = w.locator('.wetter-hinweis[data-art="frost"]');
  await expect(frost).toContainText('Frost erwartet');
  await expect(frost).toContainText('Mi 13.5.');
  await expect(frost).toContainText('Tomate');
  await expect(w.locator('.wetter-tag')).toHaveCount(7);
  await w.locator('li[data-art="pflanzen"] button', { hasText: 'Paprika' }).click();
  await expect(page.locator('#blatt-titel')).toHaveText('Paprika');
});

test('Diese Woche im Garten: andere Wochen ohne Wetter, Merkliste mit Zeitraum', async ({ page }) => {
  await oeffne(page);
  await setzeDatum(page, '2026-03-16');
  const w = page.locator('#woche');
  await expect(w.locator('h2')).toHaveText('In dieser Woche im Garten');
  await expect(w.locator('li[data-art="folgesaat"]')).toContainText('Radieschen (3 Wochen nach der ersten Saat)');
  await expect(w.locator('#wetter')).toHaveCount(0);
  await setzeDatum(page, '2027-01-04');
  await expect(w.locator('li[data-art="merkliste"]')).toContainText('Kohlsprossen');
});

test('Wetter: ohne Verbindung eine ruhige Meldung statt Warnungen', async ({ page }) => {
  await page.route('**/api.open-meteo.com/**', (r) => r.abort());
  await page.clock.setFixedTime(new Date('2026-06-15T08:00:00'));
  await page.goto('/index.html#2026/west');
  await expect(page.locator('#wetter')).toContainText('nicht abrufbar');
});

test('Notiz vom Handy: Formular öffnet ein vorausgefülltes GitHub-Issue', async ({ page }) => {
  await page.addInitScript(() => { window.__geoeffnet = []; window.open = (u) => { window.__geoeffnet.push(u); return null; }; });
  await oeffne(page);
  await setzeDatum(page, '2026-06-15');
  await page.locator('#beet circle.pflanze[data-id="paprika"]').first().click({ force: true });
  await page.locator('#notiz-zu-kultur').click();
  await expect(page.locator('#blatt-titel')).toHaveText('Notiz aus dem Garten');
  await expect(page.locator('#notiz-flaeche')).toHaveValue('west');
  await expect(page.locator('#notiz-kultur')).toHaveValue('paprika');
  await page.locator('#notiz-art').selectOption('Schädling oder Krankheit');
  await page.locator('#notiz-datum').fill('2026-08-03');
  await page.locator('#notiz-text').fill('Löcher in 3 Früchten, Raupe fotografiert');
  await page.getByRole('button', { name: 'Auf GitHub öffnen' }).click();
  const [url] = await page.evaluate(() => window.__geoeffnet);
  const u = new URL(url);
  expect(u.pathname).toBe('/apachler/pac-naturgarten-eberndorf/issues/new');
  expect(u.searchParams.get('title')).toBe('Saisonnotiz 3.8.2026: Schädling oder Krankheit Paprika (Beet West)');
  expect(u.searchParams.get('body')).toContain('Löcher in 3 Früchten');
  await expect(page.locator('.notiz-meldung')).toContainText('GitHub ist geöffnet');
});

test('Notiz: auch aus „Diese Woche“ erreichbar, leere Notiz wird nicht gesendet', async ({ page }) => {
  await page.addInitScript(() => { window.__geoeffnet = []; window.open = (u) => { window.__geoeffnet.push(u); return null; }; });
  await oeffne(page);
  await page.locator('#notiz-knopf').click();
  await expect(page.locator('#notiz-form')).toBeVisible();
  await page.locator('#notiz-flaeche').selectOption('');
  await expect(page.locator('#notiz-kultur option')).toHaveCount(1 + plaene.find((p) => p.jahr === 2026).pflanzungen.length);
  await page.getByRole('button', { name: 'Auf GitHub öffnen' }).click();
  expect(await page.evaluate(() => window.__geoeffnet.length)).toBe(0);
});

test.describe('ohne Verbindung', () => {
  test.use({ serviceWorkers: 'allow' });
  test('Service Worker hält Beetplaner und Daten bereit', async ({ page, context }) => {
    await wetterSimulieren(page);
    await page.goto('/index.html#2026/west');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();   // jetzt läuft alles über den Service Worker und landet im Speicher
    await expect(page.locator('#beet .beet-rand')).toBeVisible();
    await expect(page.locator('#offline')).toBeHidden();
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('#beet .beet-rand')).toBeVisible();
    await expect(page.locator('#beet circle.pflanze').first()).toBeAttached();
    await expect(page.locator('#offline')).toBeVisible();
    await page.getByRole('tab', { name: 'Einkauf' }).click();
    await expect(page.locator('#einkauf tbody tr').first()).toBeVisible();
    await context.setOffline(false);
    await expect(page.locator('#offline')).toBeHidden();
  });
});

test('Anzeige-Optionen bleiben nach dem Neuladen gewählt und wirken auch', async ({ page }) => {
  await oeffne(page);
  await setzeDatum(page, '2026-06-15');
  await page.locator('#opt-ist').check();
  await page.locator('#opt-vorjahr').check();
  await page.reload();
  await expect(page.locator('#beet .beet-rand')).toBeVisible();
  await expect(page.locator('#opt-ist')).toBeChecked();
  await expect(page.locator('#opt-vorjahr')).toBeChecked();
  await expect(page.locator('#opt-alle')).not.toBeChecked();
  // Ist-Stand wirkt: Pflanzen mit Status-Rand, kein Hinweis „Ist-Stand zeigen“, Prüfung des tatsächlichen Stands
  await expect(page.locator('#beet circle.pflanze').first()).toHaveAttribute('stroke-width', '2.5');
  await expect(page.locator('#verteilt .hinweis-ist')).toHaveCount(0);
  await expect(page.locator('#beet .vorjahr, #beet .vorjahr-leer').first()).toBeAttached();   // West: 2025 Ruhejahr
  await expect(page.locator('#pruefung .pruef-ansicht')).toContainText('tatsächliche Stand');
  await page.locator('#opt-ist').uncheck();
  await page.reload();
  await expect(page.locator('#beet .beet-rand')).toBeVisible();
  await expect(page.locator('#opt-ist')).not.toBeChecked();
  await expect(page.locator('#beet circle.pflanze').first()).toHaveAttribute('stroke-width', '1.5');
});
