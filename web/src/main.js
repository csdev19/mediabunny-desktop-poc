import {
  Input, ALL_FORMATS, BlobSource, CanvasSink,
  Output, Mp4OutputFormat, BufferTarget, CanvasSource, QUALITY_MEDIUM,
} from 'mediabunny';

const $ = (id) => document.getElementById(id);
$('env').textContent = navigator.userAgent;

// Runs the four capability checks. Each check is isolated so one failure does not hide the others.
async function runChecks(blob) {
  const report = {};
  const step = async (name, fn) => {
    try { report[name] = { status: 'PASS', detail: await fn() }; }
    catch (e) { report[name] = { status: 'FAIL', detail: String(e?.message ?? e) }; }
    render(report);
  };

  report.webcodecs = {
    status: typeof VideoDecoder !== 'undefined' && typeof VideoEncoder !== 'undefined' ? 'PASS' : 'FAIL',
    detail: `VideoDecoder=${typeof VideoDecoder} VideoEncoder=${typeof VideoEncoder} AudioDecoder=${typeof AudioDecoder} AudioEncoder=${typeof AudioEncoder}`,
  };
  render(report);

  const input = new Input({ source: new BlobSource(blob), formats: ALL_FORMATS });
  let video;

  // 1. Pure parsing, no WebCodecs involved.
  await step('1. metadata (parse container)', async () => {
    const format = await input.getFormat();
    const duration = await input.computeDuration();
    video = await input.getPrimaryVideoTrack();
    const audio = await input.getPrimaryAudioTrack();
    return `${format.name}, ${duration.toFixed(2)}s, video ${video?.codec} ${video?.displayWidth}x${video?.displayHeight}, audio ${audio?.codec}`;
  });

  // 2. Needs VideoDecoder: decodes a real frame and draws it.
  await step('2. decode frame (VideoDecoder)', async () => {
    if (!video) throw new Error('no video track');
    if (!(await video.canDecode())) throw new Error('track cannot be decoded here');
    const sink = new CanvasSink(video, { width: 320 });
    const frame = await sink.getCanvas(1);
    if (!frame) throw new Error('no frame returned');
    const out = $('thumb');
    out.width = frame.canvas.width; out.height = frame.canvas.height;
    out.getContext('2d').drawImage(frame.canvas, 0, 0);
    return `frame @${frame.timestamp.toFixed(2)}s ${out.width}x${out.height}`;
  });

  // 3. Needs VideoEncoder: renders 30 frames and muxes an MP4 in memory.
  await step('3. encode mp4 (VideoEncoder)', async () => {
    const canvas = new OffscreenCanvas(320, 180);
    const ctx = canvas.getContext('2d');
    const output = new Output({ format: new Mp4OutputFormat(), target: new BufferTarget() });
    const source = new CanvasSource(canvas, { codec: 'avc', bitrate: QUALITY_MEDIUM });
    output.addVideoTrack(source, { frameRate: 30 });
    await output.start();
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `hsl(${i * 12}, 80%, 50%)`;
      ctx.fillRect(0, 0, 320, 180);
      ctx.fillStyle = '#fff'; ctx.font = '48px sans-serif'; ctx.fillText(String(i), 20, 100);
      await source.add(i / 30, 1 / 30);
    }
    source.close();
    await output.finalize();
    return `${output.target.buffer.byteLength} bytes`;
  });

  render(report);
  const json = JSON.stringify(report);
  console.log('MEDIABUNNY_REPORT ' + json);
  // Optional channels so a host can capture the result headlessly.
  const reportUrl = new URLSearchParams(location.search).get('report');
  if (reportUrl) fetch(reportUrl, { method: 'POST', body: json }).catch(() => {});
  window.__TAURI__?.core?.invoke('report', { json }).catch(() => {});
  globalThis.mygo?.call('Reporter.Report', json)?.catch?.(() => {});
  return report;
}

function render(report) {
  $('results').innerHTML = Object.entries(report)
    .map(([k, v]) => `<tr><td>${k}</td><td><span class="${v.status}">${v.status}</span> ${v.detail}</td></tr>`)
    .join('');
  $('json').textContent = JSON.stringify(report, null, 2);
}

$('run-sample').onclick = async () => runChecks(await (await fetch('sample.mp4')).blob());
$('file').onchange = (e) => e.target.files[0] && runChecks(e.target.files[0]);
// Allows headless runs: index.html?auto=1
if (new URLSearchParams(location.search).has('auto')) $('run-sample').click();
