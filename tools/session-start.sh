#!/bin/sh
# SessionStart-Hook für Claude Code: macht eine frische Sitzung (z. B. in der Cloud) sofort arbeitsfähig.
#  1. Git-Identität des Menschen setzen, falls keine da ist (tools/set-git-identity.sh)
#  2. Abhängigkeiten installieren, falls node_modules fehlt – sonst kann der Daten-Hook nicht prüfen
# Playwright-Browser werden nicht geladen; `npm run test:e2e` braucht ein installiertes Chrome.
cd "$(dirname "$0")/.." || exit 0
sh tools/set-git-identity.sh
if [ ! -d node_modules/js-yaml ] && command -v npm >/dev/null 2>&1; then
  npm ci --no-audit --no-fund --loglevel=error >/dev/null 2>&1 \
    && echo "Abhängigkeiten installiert (npm ci)." \
    || echo "Hinweis: npm ci ist fehlgeschlagen – bitte von Hand ausführen, sonst prüft der Daten-Hook nicht."
fi
exit 0
