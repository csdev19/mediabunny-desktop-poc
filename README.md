# Mediabunny across desktop frameworks

Does [Mediabunny](https://mediabunny.dev) (a JS media toolkit built on WebCodecs) work unchanged inside the webview
of each desktop framework? This repo runs the same small web app in five of them and reports PASS/FAIL.

## Results

Tested on macOS 26 (arm64) only, with a 3 s H.264 + AAC MP4. All checks passed everywhere.

| App | Framework | Backend language | Webview (macOS) | Webview (Windows / Linux) | Metadata | Decode frame | Encode MP4 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `electron/` | Electron 45 (baseline) | JS | bundled Chromium | bundled Chromium | PASS | PASS | PASS |
| `tauri2/` | Tauri 2 | Rust | WKWebView | WebView2 / WebKitGTK | PASS | PASS | PASS |
| `electrobun/` | Electrobun 2 | TS (Bun) | WKWebView (CEF optional) | WebView2 / WebKitGTK (CEF optional) | PASS | PASS | PASS |
| `go-webview/` | Go + `webview_go` | Go (cgo) | WKWebView | WebView2 / WebKitGTK | PASS | PASS | PASS |
| `mygo/` | [MyGo](https://mygo.egoist.dev) 0.7 | Go (no cgo) | WKWebView | WebView2 / WebKitGTK | PASS | PASS | PASS |

Not verified: Windows, Linux (WebKitGTK is the likeliest to lack WebCodecs), other codecs (HEVC, VP9, AV1, Opus),
large files, performance.

## What is tested

The shared app in `web/` runs three Mediabunny features:

1. **Read metadata**: `Input` + `BlobSource` + `ALL_FORMATS` parse the container; reads format, duration, and
   video/audio codec and size. Pure JS, no WebCodecs.
2. **Decode a frame**: `CanvasSink.getCanvas(t)` decodes a real frame through `VideoDecoder` and draws it.
3. **Encode a video**: `Output` + `Mp4OutputFormat` + `BufferTarget` + `CanvasSource` encode 30 canvas frames through
   `VideoEncoder` (H.264) and mux an MP4 in memory.

## Run it

Requirements: Node + pnpm, Bun, Rust, Go, Xcode command line tools (macOS). Build the shared app first:

```sh
cd web && pnpm install && pnpm build
```

Then, per app (each opens a window; click **Run on bundled sample.mp4** or pick your own file):

```sh
cd electron    && pnpm install && pnpm start
cd tauri2      && cargo run --manifest-path src-tauri/Cargo.toml
cd go-webview  && go run .
cd electrobun  && bun install && bunx electrobun dev      # needs Hutch, installed on first run
cd mygo        && bun install && bun run build && open build/darwin-arm64/mediabunny-poc-mygo.app
```

Headless, all apps in a row: `./run-all.sh`. Note: if `ELECTRON_RUN_AS_NODE` is set in your shell, Electron starts as
plain Node and fails; `run-all.sh` unsets it.

## Ideas for further tests

- Your own files: HEVC, VP9, AV1, MKV/WebM, Opus audio (use the file picker).
- Run the same app on Windows and Linux.
- Audio decode/encode, and conversion of a real file with `Conversion`.
- Release-build size, startup time, and memory per framework.
