#!/usr/bin/env bash
# Runs every app headlessly (auto mode) and prints PASS/FAIL per app. macOS only.
set -u
cd "$(dirname "$0")"
summary() { python3 -c "
import sys, json
r = sys.stdin.read().strip()
if not r:
    print('   NO REPORT (app did not run or timed out)')
else:
    for k, v in json.loads(r).items():
        print('  ', v['status'], k, '-', v['detail'])
"; }

(cd web && pnpm -s build >/dev/null)
echo "== electron";  (cd electron && env -u ELECTRON_RUN_AS_NODE ./node_modules/.bin/electron . --auto 2>&1 | grep '^MEDIABUNNY_REPORT' | head -1 | sed 's/^MEDIABUNNY_REPORT //') | summary
echo "== tauri2";    (cd tauri2/src-tauri && cargo build -q 2>/dev/null; ./target/debug/mediabunny-poc-tauri --auto 2>&1 | grep '^MEDIABUNNY_REPORT' | head -1 | sed 's/^MEDIABUNNY_REPORT //') | summary
echo "== go-webview"; (cd go-webview && go build -o poc . 2>/dev/null; ./poc --auto 2>&1 | grep '^MEDIABUNNY_REPORT' | head -1 | sed 's/^MEDIABUNNY_REPORT //') | summary
echo "== electrobun"; (cd electrobun && MB_AUTO=1 ~/.hutch/bin/hutch run start 2>&1 </dev/null | grep '^MEDIABUNNY_REPORT' | head -1 | sed 's/^MEDIABUNNY_REPORT //') | summary
echo "== mygo"; (cd mygo && bun run build >/dev/null 2>&1; MB_AUTO=1 perl -e 'alarm 60; exec @ARGV' build/darwin-arm64/mediabunny-poc-mygo.app/Contents/MacOS/mediabunny-poc-mygo 2>&1 | grep '^MEDIABUNNY_REPORT' | head -1 | sed 's/^MEDIABUNNY_REPORT //') | summary
