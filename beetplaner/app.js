import yaml from './vendor/js-yaml.mjs'; // js-yaml (MIT), lokal statt CDN
import { naturjahr, saisonAm, GARTENJAHR, GEMUESE_JE_SAISON, KALENDER_ABOS, NATURJAHRESZEITEN } from './naturjahr.js';
import { TYPEN, STATUS, datum, formatDatum, positionen, anzahlGeplant, zeitraum, aktivInWoche, montagVon, kalenderwoche, huelle, ort, hatIstLage, hatIstStand, mitIstTermin, einteilung, pruefen, schlechteNachbarnVon } from './modell.js';

const BASIS = 'Gemüsegarten/';
const TAG = 86400000;
const FLAECHEN_REIHENFOLGE = ['west', 'ost', 'tomatenhaus'];
const STATUS_FARBE = {
  geplant: '#8a8f86', gepflanzt: '#3f7d3a', im_beet: '#2e7d32', geerntet: '#8d6e63',
  nicht_gepflanzt: '#b0aea8', unbekannt: '#c9a227',
};
const TYP_KURZ = { H: 'Haupt', V: 'Vor', N: 'Nach', B: 'Beikraut' };
const typBadge = (p) => el('span', { class: 'badge badge-typ', title: TYPEN[p.typ] || p.typ, text: TYP_KURZ[p.typ] || p.typ });
const statusBadge = (st) => el('span', { class: `badge badge-status ${st}`, text: STATUS[st] || st });
const ERNTE_TEXT = { '++': 'sehr gut', '+': 'gut', o: 'mittel', '-': 'schlecht', '--': 'sehr schlecht' };

const $ = (s) => document.querySelector(s);
const el = (tag, attrs = {}, ...kinder) => {
  const ns = ['svg', 'g', 'rect', 'circle', 'text', 'line', 'path', 'pattern', 'defs', 'title', 'tspan'].includes(tag);
  const e = ns ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'text') e.textContent = v;
    else if (k === 'html') e.innerHTML = v;
    else e.setAttribute(k, v);
  }
  for (const k of kinder.flat()) if (k != null) e.append(k.nodeType ? k : document.createTextNode(k));
  return e;
};
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const zustand = {
  kulturen: {}, flaechen: {}, familien: {}, standort: null, plaene: [], jahr: null, flaeche: 'west', datum: null,
  ist: false, alle: false, vorjahr: false, markiert: new Set(), meldungen: [], meldungenIst: null,
};

// ---------------------------------------------------------------- Laden

async function ladeYaml(pfad) {
  const r = await fetch(BASIS + pfad, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`${pfad}: ${r.status}`);
  return yaml.load(await r.text());
}

async function start() {
  try {
    const [kulturen, flaechen, index, standort, familien] = await Promise.all([
      ladeYaml('Grundlagen/kulturen.yaml'), ladeYaml('Grundlagen/flaechen.yaml'), ladeYaml('jahre.yaml'),
      ladeYaml('Grundlagen/standort.yaml').catch(() => null),
      ladeYaml('Grundlagen/familien.yaml').catch(() => ({})),
    ]);
    zustand.standort = standort;
    zustand.familien = familien;
    zustand.kulturen = kulturen;
    zustand.flaechen = flaechen;
    zustand.plaene = await Promise.all(index.jahre.map((j) => ladeYaml(j.plan)));
  } catch (e) {
    $('main').innerHTML = `<p class="fehler-box">Die Daten konnten nicht geladen werden (${esc(e.message)}).<br>
      Der Beetplaner muss über GitHub Pages oder einen lokalen Webserver geöffnet werden, nicht direkt als Datei.</p>`;
    return;
  }
  const [hJahr, hFlaeche] = location.hash.slice(1).split('/');
  const jahre = zustand.plaene.map((p) => p.jahr);
  const aktuell = new Date().getFullYear();
  zustand.jahr = jahre.includes(Number(hJahr)) ? Number(hJahr) : (jahre.includes(aktuell) ? aktuell : Math.max(...jahre));
  $('#jahr').append(...jahre.slice().reverse().map((j) => el('option', { value: j, text: j })));
  $('#jahr').value = zustand.jahr;
  $('#jahr').addEventListener('change', (e) => waehleJahr(Number(e.target.value)));
  document.querySelectorAll('.tabs button').forEach((b) => b.addEventListener('click', () => zeigeTab(b.dataset.tab)));
  for (const id of ['ist', 'alle', 'vorjahr']) {
    $(`#opt-${id}`).addEventListener('change', (e) => { zustand[id] = e.target.checked; zeichnePlan(); if (id === 'ist') zeichnePruefung(); });
  }
  $('#datum').addEventListener('input', (e) => { zustand.datum = new Date(startDatum().getTime() + Number(e.target.value) * 7 * TAG); zeichneZeitabhaengig(); });
  $('#heute').addEventListener('click', () => { setzeDatum(heuteOderSommer()); });
  $('#blatt-zu').addEventListener('click', schliesseBlatt);
  $('#blatt-huelle').addEventListener('click', (e) => { if (e.target.id === 'blatt-huelle') schliesseBlatt(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') schliesseBlatt(); });
  const kopf = document.querySelector('.kopf');
  const setzeKopf = () => document.documentElement.style.setProperty('--kopf-h', `${kopf.offsetHeight}px`);
  setzeKopf();
  if ('ResizeObserver' in window) new ResizeObserver(setzeKopf).observe(kopf);
  waehleJahr(zustand.jahr, hFlaeche);
}

// ---------------------------------------------------------------- Hilfen

const plan = () => zustand.plaene.find((p) => p.jahr === zustand.jahr);
const kultur = (p) => zustand.kulturen[p.kultur] || { name: p.kultur, symbol: '❔', farbe: '#999', abstand: 20 };
/** Der Zeitregler läuft in Wochen: Montag der Woche mit dem 1. Jänner bis Ende März des Folgejahres. */
const startDatum = () => montagVon(new Date(Date.UTC(zustand.jahr, 0, 1)));
const endDatum = () => new Date(Date.UTC(zustand.jahr + 1, 2, 31));
const kalStart = () => new Date(Date.UTC(zustand.jahr, 0, 1));
/**
 * Steht die Pflanzung in der gewählten Woche im Beet? Im Ist-Stand zählen nicht gepflanzte
 * Kulturen nicht, und was laut Rückmeldung noch im Beet steht, bleibt bis heute sichtbar.
 */
const imPlan = (p0) => {
  if (!zustand.ist) return aktivInWoche(p0, zustand.datum);
  const p = mitIstTermin(p0);
  const st = p.ist?.status;
  if (st === 'nicht_gepflanzt') return false;
  if (st === 'im_beet') {
    const h = new Date(); const heute = Date.UTC(h.getFullYear(), h.getMonth(), h.getDate());
    const { von } = zeitraum(p);
    const sonntag = zustand.datum.getTime() + 6 * TAG;
    if (von <= sonntag && zustand.datum.getTime() <= Math.max(heute, zeitraum(p).bis.getTime())) return true;
  }
  return aktivInWoche(p, zustand.datum);
};
const lage = (p) => ort(p, zustand.ist);
const pflanzungenHier = () => (plan().pflanzungen || []).filter((p) => p.flaeche === zustand.flaeche);
const istGanzesBeet = (p) => {
  const f = zustand.flaechen[p.flaeche];
  const b = lage(p).bereich;
  return Boolean(b) && b.b * b.t >= 0.9 * f.breite * f.laenge;
};

function heuteOderSommer() {
  const h = new Date(); const heute = new Date(Date.UTC(h.getFullYear(), h.getMonth(), h.getDate()));
  return heute >= startDatum() && heute <= endDatum() ? heute : new Date(Date.UTC(zustand.jahr, 5, 15));
}

function setzeDatum(d) {
  zustand.datum = d;
  zustand.datum = montagVon(d);
  $('#datum').value = Math.round((zustand.datum - startDatum()) / TAG / 7);
  zeichneZeitabhaengig();
}

function flaechenDesJahres() {
  const ids = new Set([...Object.keys(plan().flaechen || {}), ...(plan().pflanzungen || []).map((p) => p.flaeche)]);
  return FLAECHEN_REIHENFOLGE.filter((f) => ids.has(f)).concat([...ids].filter((f) => !FLAECHEN_REIHENFOLGE.includes(f)));
}

// ---------------------------------------------------------------- Auswahl

function waehleJahr(jahr, flaecheWunsch) {
  zustand.jahr = jahr;
  zustand.markiert.clear();
  const fl = flaechenDesJahres();
  const aktiv = fl.find((f) => plan().flaechen?.[f]?.rolle === 'aktiv' && zustand.flaechen[f]?.art === 'Heubeet');
  zustand.flaeche = fl.includes(flaecheWunsch) ? flaecheWunsch : (fl.includes(zustand.flaeche) && plan().flaechen?.[zustand.flaeche]?.rolle === 'aktiv' ? zustand.flaeche : aktiv || fl[0]);
  const basis = { plan: plan(), kulturen: zustand.kulturen, flaechen: zustand.flaechen, familien: zustand.familien, vorjahre: zustand.plaene };
  zustand.meldungen = pruefen(basis);
  zustand.meldungenIst = hatIstStand(plan()) ? pruefen({ ...basis, ist: true }) : null;

  const tage = Math.round((endDatum() - startDatum()) / TAG);
  $('#datum').max = Math.floor(tage / 7);
  $('#monate').innerHTML = '';
  for (let m = 0; m < 15; m++) {
    const d = new Date(Date.UTC(zustand.jahr, m, 1));
    const links = ((d - startDatum()) / TAG / (Math.floor(tage / 7) * 7)) * 100;
    $('#monate').append(el('span', { class: m >= 12 ? 'folgejahr' : null, style: `left:${links}%`, text: 'JFMAMJJASONDJFM'[m] }));
  }
  zeichneFlaechenWahl();
  zeichnePruefung();
  setzeDatum(heuteOderSommer());
}

function waehleFlaeche(f) {
  zustand.flaeche = f;
  history.replaceState(null, '', `#${zustand.jahr}/${f}`);
  zeichneFlaechenWahl();
  zeichneAlles();
}

function zeichneFlaechenWahl() {
  history.replaceState(null, '', `#${zustand.jahr}/${zustand.flaeche}`);
  const box = $('#flaechen');
  box.innerHTML = '';
  for (const f of flaechenDesJahres()) {
    const rolle = plan().flaechen?.[f]?.rolle;
    box.append(el('button', {
      type: 'button', class: f === zustand.flaeche ? 'aktiv' : '', role: 'tab', 'aria-selected': String(f === zustand.flaeche), onclick: () => waehleFlaeche(f),
    }, zustand.flaechen[f]?.name || f, rolle === 'ruhe' ? el('small', { text: ' Ruhe' }) : null));
  }
}

function zeigeTab(tab) {
  document.querySelectorAll('.tabs button').forEach((b) => {
    b.classList.toggle('aktiv', b.dataset.tab === tab);
    b.setAttribute('aria-selected', String(b.dataset.tab === tab));
  });
  document.querySelectorAll('.tab').forEach((s) => s.classList.toggle('aktiv', s.id === `tab-${tab}`));
  const tabs = document.querySelector('.tabs');
  if (tabs.getBoundingClientRect().top < 0 || window.scrollY > tabs.offsetTop) window.scrollTo({ top: Math.max(0, tabs.offsetTop - 70) });
}

// ---------------------------------------------------------------- Über die Fläche

function zeichneFlaechenInfo() {
  const f = zustand.flaechen[zustand.flaeche] || {};
  const s = zustand.standort || {};
  const box = $('#flaechen-inhalt');
  box.innerHTML = '';
  const dl = (rows) => el('dl', {}, ...rows.filter(([, v]) => v).flatMap(([a, b]) => [el('dt', { text: a }), el('dd', { text: b })]));
  box.append(dl([
    ['Größe', `${f.breite / 100} × ${f.laenge / 100} m (${(f.breite * f.laenge / 10000).toLocaleString('de-AT')} m²)`],
    ['Art', f.art], ['Angelegt', f.angelegt], ['Ausrichtung', f.ausrichtung], ['Lage', f.lage], ['Bauweise', f.bauweise], ['Boden', f.boden],
    ['Aufbau', f.aufbau], ['Wasser', f.wasser], ['Rhythmus', f.rhythmus],
  ]));
  if (f.besonderheiten?.length) box.append(el('h3', { text: 'Besonderheiten' }), el('ul', {}, ...f.besonderheiten.map((b) => el('li', { text: b }))));
  // Anbauhistorie aus allen Jahresplänen, mit der tatsächlichen Lage
  const jahre = zustand.plaene.filter((p) => p.flaechen?.[zustand.flaeche] || (p.pflanzungen || []).some((q) => q.flaeche === zustand.flaeche)).sort((a, b) => a.jahr - b.jahr);
  if (jahre.length) {
    box.append(el('h3', { text: 'Anbauhistorie' }), el('ul', {}, ...jahre.map((p) => {
      const rolle = p.flaechen?.[zustand.flaeche]?.rolle;
      const fam = [...new Set((p.pflanzungen || []).filter((q) => q.flaeche === zustand.flaeche && q.ist?.status !== 'nicht_gepflanzt').map((q) => zustand.kulturen[q.kultur]?.familie).filter(Boolean))];
      return el('li', {}, el('strong', { text: `${p.jahr}: ` }), rolle === 'ruhe' ? 'Ruhejahr' : rolle === 'aktiv' ? 'bepflanzt' : '', fam.length ? ` – ${fam.join(', ')}` : '');
    })));
  }
  if (f.offen?.length) box.append(el('h3', { text: 'Noch offen' }), el('ul', { class: 'offen' }, ...f.offen.map((b) => el('li', { text: b }))));
  box.append(el('h3', { text: 'Garten' }), dl([['Ort', s.ort && `${s.ort}, ${s.hoehe} m`], ['Klima', s.klima], ['Wasser', s.wasser], ['Anzucht', s.anzucht]]));
  $('#flaechen-summary').textContent = `Über ${f.art === 'Tomatenhaus' ? 'das Tomatenhaus' : 'das Beet'}`;
}

function zeichneAlles() {
  zeichneFlaechenInfo();
  zeichnePlan();
  zeichneKalender();
  zeichneListe();
}

function zeichneZeitabhaengig() {
  $('#datum-text').textContent = wochenText(zustand.datum);
  zeichneSaison();
  zeichneAlles();
}

// ---------------------------------------------------------------- Plan (SVG)

function zeichnePlan() {
  const f = zustand.flaechen[zustand.flaeche];
  const fp = plan().flaechen?.[zustand.flaeche] || {};
  const B = f.breite, L = f.laenge;
  const M = { l: 30, r: 14, t: 62, b: 26 };
  const sx = (x) => x + M.l;
  const sy = (y) => M.t + (L - y);
  const svg = $('#beet');
  svg.innerHTML = '';
  svg.setAttribute('viewBox', `0 0 ${B + M.l + M.r} ${L + M.t + M.b}`);

  $('#titel').textContent = f.name;
  $('#kicker').textContent = `Gemüsegarten ${zustand.jahr}${fp.rolle === 'ruhe' ? ' · Ruhejahr' : ''}`;
  document.title = `${f.name} ${zustand.jahr} – Beetplaner`;
  $('#flaechen-info').innerHTML = `${esc(f.art || '')} · ${B / 100} × ${L / 100} m` +
    (fp.notiz ? `<br><span class="leise">${esc(fp.notiz)}</span>` : '');

  const defs = el('defs', {},
    el('pattern', { id: 'erde', width: 14, height: 14, patternUnits: 'userSpaceOnUse' },
      el('rect', { width: 14, height: 14, fill: '#e9dfcc' }),
      el('circle', { cx: 3, cy: 4, r: 0.9, fill: '#c7b493' }),
      el('circle', { cx: 10, cy: 10, r: 0.7, fill: '#cdbb9b' })),
    el('pattern', { id: 'schraffur', width: 8, height: 8, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' },
      el('line', { x1: 0, y1: 0, x2: 0, y2: 8, stroke: '#00000022', 'stroke-width': 3 })));
  svg.append(defs);

  // Himmelsrichtung
  svg.append(el('g', { 'aria-label': 'Norden' }, el('path', { class: 'nord-pfeil', d: 'M8 16 L12 4 L16 16 M12 4 V20' }), el('text', { x: 20, y: 15, class: 'nord', text: 'N' })));
  svg.append(el('text', { x: sx(B / 2), y: M.t + L + 20, class: 'sued', text: 'S' }));

  // Beet
  svg.append(el('rect', { x: sx(0), y: sy(L), width: B, height: L, fill: 'url(#erde)', rx: 4, class: 'beet-rand' }));

  // Zonen
  const { zonen, wege } = einteilung(fp, zustand.ist);
  zonen.forEach((z, i) => {
    svg.append(el('rect', { x: sx(0), y: sy(z.y + z.t), width: B, height: z.t, class: `zone zone-${i % 2}` }));
    svg.append(el('text', { x: sx(4), y: sy(z.y + z.t) + 9, class: 'zonen-text', text: z.id }));
  });

  // Raster und Achsen
  for (let x = 0; x <= B; x += 50) {
    svg.append(el('line', { x1: sx(x), y1: sy(0), x2: sx(x), y2: sy(L), class: x % 100 ? 'raster fein' : 'raster' }));
    if (x % 100 === 0) svg.append(el('text', { x: sx(x), y: sy(0) + 12, class: 'achse', text: x }));
  }
  for (let y = 0; y <= L; y += 50) {
    svg.append(el('line', { x1: sx(0), y1: sy(y), x2: sx(B), y2: sy(y), class: y % 100 ? 'raster fein' : 'raster' }));
    if (y % 100 === 0) svg.append(el('text', { x: sx(0) - 4, y: sy(y) + 3, class: 'achse links', text: y }));
  }

  // Wege
  for (const w of wege) {
    svg.append(el('rect', { x: sx(0), y: sy(w.y + w.t), width: B, height: w.t, class: 'weg' }));
    svg.append(el('text', { x: sx(B / 2), y: sy(w.y + w.t / 2) + 3, class: 'weg-text', text: w.name }));
  }

  // Vorjahr
  if (zustand.vorjahr) {
    const vorher = zustand.plaene.filter((p) => p.jahr < zustand.jahr && (p.pflanzungen || []).some((q) => q.flaeche === zustand.flaeche))
      .sort((a, b) => b.jahr - a.jahr)[0];
    if (vorher) {
      for (const q of vorher.pflanzungen.filter((x) => x.flaeche === zustand.flaeche)) {
        const k = zustand.kulturen[q.kultur] || {};
        if (q.ist?.status === 'nicht_gepflanzt') continue;
        const h = huelle(ort(q, true), k);
        if (!h) continue;
        svg.append(el('g', { class: 'vorjahr' },
          el('rect', { x: sx(h.x), y: sy(h.y + h.t), width: h.b, height: h.t }),
          el('text', { x: sx(h.x + h.b / 2), y: sy(h.y + h.t / 2) + 3, text: `${vorher.jahr}: ${k.name || q.kultur} · ${k.familie || ''}` })));
      }
    } else {
      svg.append(el('text', { x: sx(B / 2), y: sy(L / 2), class: 'vorjahr-leer', text: 'Kein Vorjahr erfasst' }));
    }
  }

  const alle = pflanzungenHier();
  const sichtbar = imPlan;

  // Bereiche (Beschriftungen kommen zuletzt, damit Pflanzen sie nicht verdecken)
  const beschriftungen = [];
  const labelStapel = new Map();
  for (const p of alle.filter((q) => lage(q).bereich && !istGanzesBeet(q))) {
    const aktiv = sichtbar(p);
    if (!aktiv && !zustand.alle) continue;
    const k = kultur(p), b = lage(p).bereich;
    const nicht = zustand.ist && p.ist?.status === 'nicht_gepflanzt';
    const g = el('g', { 'data-id': p.id, class: `bereich ${aktiv ? '' : 'inaktiv'} ${nicht ? 'nicht' : ''} ${zustand.markiert.has(p.id) ? 'markiert' : ''}`, onclick: () => zeigeDetails(p) },
      el('rect', { class: 'flaeche', x: sx(b.x) + 2, y: sy(b.y + b.t) + 2, width: b.b - 4, height: b.t - 4, fill: k.farbe, stroke: k.farbe }),
      el('rect', { x: sx(b.x) + 2, y: sy(b.y + b.t) + 2, width: b.b - 4, height: b.t - 4, fill: 'url(#schraffur)', stroke: 'none' }),
    );
    const zahl = zustand.ist ? p.ist?.anzahl : p.wunsch;
    const schluessel = `${b.x}|${b.y}|${b.b}|${b.t}`;
    const stapel = (labelStapel.get(schluessel) || 0);
    labelStapel.set(schluessel, stapel + 1);
    beschriftungen.push(el('text', { x: sx(b.x + b.b / 2), y: sy(b.y + b.t) + 16 + stapel * 13, class: `bereich-text ${aktiv ? '' : 'inaktiv'}`, 'data-id': p.id, text: `${k.name}${zahl ? ` ×${zahl}` : ''}`, onclick: () => zeigeDetails(p) }));
    svg.append(g);
  }

  // Einzelpflanzen
  for (const p of alle.filter((q) => { const o = lage(q); return o.punkte || o.reihen; })) {
    const aktiv = sichtbar(p);
    if (!aktiv && !zustand.alle) continue;
    const k = kultur(p);
    const r = Math.max(5, Math.min(28, (k.abstand || 20) / 2));
    const status = p.ist?.status;
    const nicht = zustand.ist && status === 'nicht_gepflanzt';
    const g = el('g', { 'data-id': p.id, class: `pflanzung ${aktiv ? '' : 'inaktiv'} ${nicht ? 'nicht' : ''} ${zustand.markiert.has(p.id) ? 'markiert' : ''}`, onclick: () => zeigeDetails(p) });
    for (const q of positionen(lage(p))) {
      const cx = sx(q.x), cy = sy(q.y);
      g.append(el('circle', { cx, cy, r: r + 7, class: 'treffer' }));
      if (zustand.markiert.has(p.id)) g.append(el('circle', { cx, cy, r: r + 4, class: 'markier-ring' }));
      g.append(el('circle', {
        cx, cy, r, fill: nicht ? '#f4f1ea' : k.farbe, class: 'pflanze', 'data-id': p.id, 'data-x': q.x, 'data-y': q.y,
        stroke: zustand.ist ? STATUS_FARBE[status || 'geplant'] : '#fff',
        'stroke-width': zustand.ist ? 2.5 : 1.5,
        'stroke-dasharray': nicht ? '3 2' : null,
      }));
      g.append(el('text', { x: cx, y: cy + r * 0.38, class: 'symbol', 'font-size': Math.max(7, r * 1.05), text: nicht ? '✕' : k.symbol }));
      if (q.n > 1) g.append(el('text', { x: cx + r * 0.8, y: cy - r * 0.7, class: 'je', text: `×${q.n}` }));
    }
    svg.append(g);
  }

  svg.append(...beschriftungen);
  zeichneVerteilt(alle);
  zeichneLegende(alle);
}

/** „X 150–300 · Y 0–80 cm“ oder „5 Positionen“ */
function lageText(o) {
  if (o.bereich) return `X ${o.bereich.x}–${o.bereich.x + o.bereich.b} · Y ${o.bereich.y}–${o.bereich.y + o.bereich.t} cm`;
  const pos = positionen(o);
  const xs = pos.map((q) => q.x), ys = pos.map((q) => q.y);
  return `${pos.length} Positionen, X ${Math.min(...xs)}–${Math.max(...xs)} · Y ${Math.min(...ys)}–${Math.max(...ys)} cm`;
}

function zeichneVerteilt(alle) {
  const box = $('#verteilt');
  box.innerHTML = '';
  const mitIst = alle.filter(hatIstLage).length;
  if (mitIst && !zustand.ist) {
    box.append(el('p', { class: 'hinweis-ist' }, `Für ${mitIst} ${mitIst === 1 ? 'Kultur' : 'Kulturen'} ist die tatsächliche Lage erfasst – `, el('button', { type: 'button', class: 'link-knopf', onclick: () => setzeIst(true) }, 'Ist-Stand zeigen ↓')));
  }
  const v = alle.filter((p) => istGanzesBeet(p) && (imPlan(p) || zustand.alle));
  if (!v.length) return;
  box.append(el('span', { class: 'leise', text: 'Im ganzen Beet verteilt: ' }));
  for (const p of v) {
    const k = kultur(p);
    box.append(el('button', { type: 'button', class: `chip-gestrichelt ${imPlan(p) ? '' : 'inaktiv'}`, onclick: () => zeigeDetails(p) }, el('span', { class: 'punkt klein', style: `background:${k.farbe}` }), k.name));
  }
}

function zeichneLegende(alle) {
  const ul = $('#legende');
  ul.innerHTML = '';
  const aktiv = alle.filter(imPlan).sort((a, b) => 'VHNB'.indexOf(a.typ) - 'VHNB'.indexOf(b.typ));
  if (!aktiv.length) {
    ul.append(el('li', { class: 'leer', text: plan().flaechen?.[zustand.flaeche]?.rolle === 'ruhe' ? 'Ruhejahr – nichts gepflanzt.' : 'Zu diesem Datum steht laut Plan nichts im Beet.' }));
    return;
  }
  for (const p of aktiv) {
    const k = kultur(p);
    const n = anzahlGeplant(p);
    ul.append(el('li', { onclick: () => zeigeDetails(p) },
      el('span', { class: 'punkt', style: `background:${k.farbe}` }, k.symbol),
      el('span', { class: 'leg-name' }, k.name, p.sorte ? el('small', { text: ` ${p.sorte.split(' (')[0]}` }) : null),
      typBadge(p),
      el('span', { class: 'leg-zahl', text: n != null ? `${n}` : '' }),
      zustand.ist && p.ist?.status ? statusBadge(p.ist.status) : null));
  }
}

const MONATE = ['Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
/** „15.–21. Juni 2026 · KW 25“ bzw. „29. Juni – 5. Juli 2026 · KW 27“ */
function wochenText(mo) {
  const so = new Date(mo.getTime() + 6 * TAG);
  const m1 = MONATE[mo.getUTCMonth()], m2 = MONATE[so.getUTCMonth()];
  const von = mo.getUTCMonth() === so.getUTCMonth() ? `${mo.getUTCDate()}.` : `${mo.getUTCDate()}. ${m1}${mo.getUTCFullYear() !== so.getUTCFullYear() ? ` ${mo.getUTCFullYear()}` : ''} `;
  return `${von}–${mo.getUTCMonth() === so.getUTCMonth() ? '' : ' '}${so.getUTCDate()}. ${m2} ${so.getUTCFullYear()} · KW ${kalenderwoche(mo)}`;
}

// ---------------------------------------------------------------- Naturjahreszeit

function zeichneSaison() {
  const s = saisonAm(new Date(zustand.datum.getTime() + 3 * TAG), zustand.standort);
  $('#saison').innerHTML = `<span class="saison-punkt" style="background:${s.farbe}"></span><strong>${esc(s.name)}</strong> <span class="leise">· ab ${formatDatum(s.beginn).replace(/ \d{4}$/, '')} · Zeiger: ${esc(s.zeiger)}</span>`;
  const box = $('#gartenjahr');
  box.innerHTML = '';
  const liste = el('ul', { class: 'aufgaben' });
  for (const t of GEMUESE_JE_SAISON[s.id] || []) liste.append(el('li', { class: 'eigen' }, el('span', { class: 'badge badge-typ', text: 'Unser Beet' }), ' ', t));
  for (const t of GARTENJAHR[s.id] || []) liste.append(el('li', { text: t }));
  box.append(el('p', { class: 'leise klein' }, `${s.name} in ${zustand.standort?.ort?.split(' (')[0] || 'Eberndorf'}: erkennbar an „${s.zeiger}“ oder „${s.auch}“. Tatsächlich zeigt die Natur, wann es so weit ist.`), liste);
  box.append(el('p', { class: 'leise klein' }, 'Quelle: ', el('a', { href: 'https://naturgarten.bio/naturgarten', text: 'naturgarten.bio' }), ' – Gartenjahr und Naturjahreszeiten (DWD-Mittel, Hopkins-Regel). Als Kalender abonnieren: ',
    ...KALENDER_ABOS.flatMap((k, i) => [i ? ' · ' : '', el('a', { href: k.url.replace('https://', 'webcal://'), text: k.name })])));
}

// ---------------------------------------------------------------- Kalender

function zeichneKalender() {
  const box = $('#gantt');
  box.innerHTML = '';
  const s = kalStart(), e = endDatum(), span = e - s;
  const pct = (d) => Math.max(0, Math.min(100, ((d - s) / span) * 100));
  const kopf = el('div', { class: 'g-zeile g-kopf' }, el('div', { class: 'g-name' }, 'Kultur'));
  const skala = el('div', { class: 'g-bahn' });
  for (let m = 0; m < 15; m++) {
    const d = new Date(Date.UTC(zustand.jahr, m, 1));
    skala.append(el('span', { class: `g-monat ${m >= 12 ? 'folgejahr' : ''}`, style: `left:${pct(d)}%`, text: 'JFMAMJJASONDJFM'[m] }));
  }
  kopf.append(skala);
  box.append(kopf);
  // Naturjahreszeiten-Band
  const band = el('div', { class: 'g-bahn g-band' });
  const nj = [...naturjahr(zustand.jahr - 1, zustand.standort), ...naturjahr(zustand.jahr, zustand.standort), ...naturjahr(zustand.jahr + 1, zustand.standort)];
  nj.forEach((n, i) => {
    const bis = nj[i + 1]?.beginn || e;
    if (bis <= s || n.beginn >= e) return;
    band.append(el('span', { class: 'g-saison', style: `left:${pct(n.beginn)}%;width:${pct(bis) - pct(n.beginn)}%;background:${n.farbe}`, title: `${n.name} – ${n.zeiger}`, text: n.name.slice(0, 2) }));
  });
  band.append(el('span', { class: 'g-heute', style: `left:${pct(zustand.datum)}%` }));
  box.append(el('div', { class: 'g-zeile g-kopf' }, el('div', { class: 'g-name leise', text: 'Naturjahreszeit' }), band));
  const liste = pflanzungenHier().slice().sort((a, b) => datum(a.von) - datum(b.von));
  if (!liste.length) box.append(el('p', { class: 'leer', text: 'Für diese Fläche ist in diesem Jahr nichts geplant.' }));
  for (const p of liste) {
    const k = kultur(p);
    const { von, bis } = zeitraum(p);
    const nicht = p.ist?.status === 'nicht_gepflanzt';
    const bahn = el('div', { class: 'g-bahn' });
    for (let m = 0; m < 15; m++) bahn.append(el('span', { class: 'g-linie', style: `left:${pct(new Date(Date.UTC(zustand.jahr, m, 1)))}%` }));
    bahn.append(el('span', {
      class: `g-balken ${nicht ? 'nicht' : ''} ${zustand.markiert.has(p.id) ? 'markiert' : ''}`,
      style: `left:${pct(von)}%;width:${Math.max(1.5, pct(bis) - pct(von))}%;background:${nicht ? '' : k.farbe}`,
      title: `${formatDatum(von)} – ${formatDatum(bis)}`,
    }));
    bahn.append(el('span', { class: 'g-heute', style: `left:${pct(zustand.datum)}%` }));
    box.append(el('div', { class: 'g-zeile', onclick: () => zeigeDetails(p) },
      el('div', { class: 'g-name' }, el('span', { class: 'punkt klein', style: `background:${k.farbe}` }), k.name),
      bahn));
  }
  box.append(el('p', { class: 'leise klein', text: 'Grauer Balken = nicht gepflanzt · Linie = gewähltes Datum im Plan · J F M nach Dezember = Folgejahr' }));
}

// ---------------------------------------------------------------- Liste

function zeichneListe() {
  const box = $('#liste');
  box.innerHTML = '';
  const alle = pflanzungenHier();
  if (!alle.length) { box.append(el('p', { class: 'leer', text: 'Für diese Fläche ist in diesem Jahr nichts geplant.' })); return; }
  for (const typ of ['H', 'V', 'N', 'B']) {
    const gruppe = alle.filter((p) => p.typ === typ);
    if (!gruppe.length) continue;
    box.append(el('h2', { class: 'heading-sub abschnitt', text: { H: 'Hauptkulturen', V: 'Vorkulturen', N: 'Nachkulturen', B: 'Beikräuter' }[typ] }));
    const tab = el('table', { class: 'tabelle' },
      el('thead', {}, el('tr', {}, el('th', { text: 'Kultur' }), el('th', { text: 'Plan' }), el('th', { text: 'Ist' }), el('th', { text: 'Ernte' }))));
    const tb = el('tbody');
    for (const p of gruppe) {
      const k = kultur(p);
      const n = anzahlGeplant(p);
      const planTxt = p.bereich ? (p.wunsch ?? '–') : (p.wunsch != null && p.wunsch !== n ? `${n} / ${p.wunsch}` : n);
      const st = p.ist?.status;
      tb.append(el('tr', { onclick: () => zeigeDetails(p) },
        el('td', {}, el('span', { class: 'kultur' }, el('span', { class: 'punkt klein', style: `background:${k.farbe}` }), k.name)),
        el('td', { text: planTxt }),
        el('td', {}, p.ist?.anzahl != null ? `${p.ist.anzahl} ` : '', st ? statusBadge(st) : '–'),
        el('td', { class: 'ernte', text: p.ist?.ernte || '' })));
    }
    tab.append(tb);
    box.append(el('div', { class: 'tabelle-huelle' }, tab));
  }
  box.append(el('p', { class: 'leise klein', text: 'Plan: positioniert / gewünscht · Ernte: ++ sehr gut, + gut, o mittel, - schlecht' }));
}

// ---------------------------------------------------------------- Prüfung

/** Meldungen passend zur Ansicht: Ist-Stand geprüft, wenn „Ist-Stand“ an ist und das Jahr einen hat. */
const meldungen = () => (zustand.ist && zustand.meldungenIst) || zustand.meldungen;

function setzeIst(an) {
  zustand.ist = an;
  $('#opt-ist').checked = an;
  zeichnePlan();
  zeichnePruefung();
}

function zeichnePruefung() {
  const box = $('#pruefung');
  box.innerHTML = '';
  const m = meldungen();
  if (zustand.meldungenIst) {
    const istAn = zustand.ist;
    box.append(el('p', { class: 'pruef-ansicht' },
      istAn ? 'Geprüft wird der tatsächliche Stand (Lage, Anzahl, Pfade wie erfasst; Termine wie geplant, wo nichts erfasst ist). '
        : 'Geprüft wird der Plan, wie er damals war. ',
      el('button', { type: 'button', class: 'link-knopf', onclick: () => setzeIst(!istAn) }, istAn ? 'Plan prüfen' : 'Ist-Stand prüfen')));
  }
  const ernst = m.filter((x) => x.stufe !== 'hinweis').length;
  $('#pruef-zahl').textContent = ernst || '';
  if (!m.length) { box.append(el('p', { class: 'ok', text: '✓ Keine Auffälligkeiten.' })); return; }
  const titel = { fehler: 'Fehler', warnung: 'Warnungen', hinweis: 'Hinweise' };
  for (const stufe of ['fehler', 'warnung', 'hinweis']) {
    const g = m.filter((x) => x.stufe === stufe);
    if (!g.length) continue;
    box.append(el('h2', { class: 'heading-sub abschnitt', text: `${titel[stufe]} (${g.length})` }));
    for (const x of g) {
      box.append(el('button', { class: `meldung ${stufe}`, onclick: () => springeZu(x) },
        el('span', { class: 'thema', text: x.thema }), el('span', { text: x.text })));
    }
  }
}

function springeZu(meldung) {
  const p0 = plan().pflanzungen.find((p) => p.id === meldung.ids[0]);
  zustand.markiert = new Set(meldung.ids);
  if (p0) {
    zustand.flaeche = p0.flaeche;
    zeichneFlaechenWahl();
    const starts = meldung.ids.map((id) => plan().pflanzungen.find((p) => p.id === id)).filter(Boolean).map((p) => datum(p.von));
    const d = new Date(Math.max(...starts));
    zeigeTab('plan');
    setzeDatum(d < kalStart() ? kalStart() : d);
  }
}

// ---------------------------------------------------------------- Details

function zeigeDetails(p) {
  const k = kultur(p);
  const { von, bis } = zeitraum(p);
  const n = anzahlGeplant(p);
  const nameVon = (ids) => (ids || []).map((id) => zustand.kulturen[id]?.name || id).join(', ') || '–';
  const meld = meldungen().filter((m) => m.ids.includes(p.id));
  const zeilen = [
    ['Typ', TYPEN[p.typ] || p.typ],
    ['Zeitraum', `${formatDatum(von)} – ${formatDatum(bis)}`],
    ['Geplant', `${n ?? '–'}${p.wunsch != null && p.wunsch !== n ? ` (gewünscht ${p.wunsch})` : ''}${p.je ? ` · ${p.je} je Stange` : ''}`],
    p.sorte ? ['Sorte', p.sorte] : null,
    p.notiz ? ['Plan-Notiz', p.notiz] : null,
    p.begruendung ? ['Begründung', p.begruendung] : null,
  ].filter(Boolean);
  const ist = p.ist ? [
    ['Status', STATUS[p.ist.status] || p.ist.status],
    p.ist.anzahl != null ? ['Anzahl', p.ist.anzahl] : null,
    hatIstLage(p) ? ['Tatsächliche Lage', lageText(ort(p, true))] : null,
    p.ist.ernte ? ['Ernte', `${p.ist.ernte} (${ERNTE_TEXT[p.ist.ernte] || ''})`] : null,
    p.ist.notiz ? ['Notiz', p.ist.notiz] : null,
  ].filter(Boolean) : [];
  const fam = zustand.familien[k.familie];
  const saison = NATURJAHRESZEITEN.find((s) => s.id === k.naturjahreszeit);
  const wissen = [
    k.botanisch ? ['Botanisch', k.botanisch] : null,
    ['Familie', `${k.familie}${fam ? ` · Anbaupause ${fam.anbaupause} ${fam.anbaupause === 1 ? 'Jahr' : 'Jahre'}` : ''}`],
    ['Platz', `${k.abstand} cm${k.reihe ? ` · Reihe ${k.reihe} cm` : ''} · Höhe ca. ${k.hoehe} cm`],
    k.licht ? ['Licht', k.licht] : null,
    k.boden ? ['Boden', `${k.boden}${k.wurzel ? ` · Wurzel ${k.wurzel}` : ''}`] : null,
    ['Nährstoffe / Wasser', `${k.zehrer || '–'} / ${k.wasser || '–'}`],
    k.anbau ? ['Anbau', [k.anbau, k.aussaat && `Aussaat ${k.aussaat}`, k.pflanzung && `Pflanzung ${k.pflanzung}`].filter(Boolean).join(' · ')] : null,
    saison ? ['Wann', `${saison.name} (${saison.zeiger})`] : null,
    k.ernte ? ['Ernte', k.ernte] : null,
    ['Gute Nachbarn', nameVon(k.gut)], ['Schlechte Nachbarn', nameVon(schlechteNachbarnVon(p.kultur, zustand.kulturen))],
    k.schaedlinge?.length ? ['Schädlinge', k.schaedlinge.join(', ')] : null,
    k.krankheiten?.length ? ['Krankheiten', k.krankheiten.join(', ')] : null,
    k.frost ? ['Frost', 'frostempfindlich – erst nach den Eisheiligen'] : null,
    k.bedarf ? ['Küche', k.bedarf] : null,
    k.hinweis ? ['Hinweis', k.hinweis] : null,
  ].filter(Boolean);
  const SICHER = { beobachtet: 'beobachtet', bestaetigt: 'bestätigt', hypothese: 'Hypothese' };
  const erfahrungen = [...(k.erfahrungen || [])].sort((a, b) => b.jahr - a.jahr);
  const sorten = k.sorten || [];
  const anker = k.name.toLowerCase().replace(/[^a-zäöüß0-9]+/g, '-');
  const dl = (rows) => `<dl>${rows.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl>`;
  $('#blatt-inhalt').innerHTML = `
    <div class="blatt-titel"><span class="punkt gross" style="background:${k.farbe}">${k.symbol}</span>
      <div><h2 class="heading-sub" id="blatt-titel">${esc(k.name)}</h2><span class="leise">${esc(zustand.flaechen[p.flaeche]?.name || '')} · ${zustand.jahr}</span></div></div>
    ${dl(zeilen)}
    ${ist.length ? `<h3>Ist-Stand</h3>${dl(ist)}` : ''}
    ${meld.length ? `<h3>Prüfung</h3>${meld.map((m) => `<p class="meldung ${m.stufe}"><span class="thema">${esc(m.thema)}</span> ${esc(m.text)}</p>`).join('')}` : ''}
    ${erfahrungen.length ? `<h3>Unsere Erfahrungen</h3><ul class="erfahrungen">${erfahrungen.map((e) => `<li><span class="badge badge-status">${e.jahr} · ${esc(SICHER[e.sicherheit] || 'beobachtet')}</span> ${esc(e.text)}</li>`).join('')}</ul>` : ''}
    ${sorten.length ? `<h3>Erprobte Sorten</h3><ul class="erfahrungen">${sorten.map((s) => `<li><strong>${esc(s.name)}</strong> (${esc(s.quelle || '')}, ${s.jahr}): ${esc(s.ergebnis || '')}</li>`).join('')}</ul>` : ''}
    <h3>Kulturwissen</h3>${dl(wissen)}
    <p class="klein"><a href="https://github.com/apachler/pac-naturgarten-eberndorf/blob/main/Gem%C3%BCsegarten/Grundlagen/Kulturwissen.md#${encodeURIComponent(anker)}">Steckbrief ${esc(k.name)} ↗</a></p>`;
  $('#blatt-huelle').hidden = false;
  requestAnimationFrame(() => $('#blatt-huelle').classList.add('offen'));
}

function schliesseBlatt() {
  $('#blatt-huelle').classList.remove('offen');
  setTimeout(() => { $('#blatt-huelle').hidden = true; }, 200);
}

start();
