const { app, BrowserWindow, protocol, net } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const DIST = path.join(__dirname, '..', 'web', 'dist');
const auto = process.argv.includes('--auto');

// Serve dist/ over a custom scheme so fetch('sample.mp4') works (file:// blocks it).
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }]);

app.whenReady().then(() => {
  protocol.handle('app', (req) => {
    const p = new URL(req.url).pathname;
    return net.fetch(pathToFileURL(path.join(DIST, p === '/' ? 'index.html' : p)).toString());
  });
  const win = new BrowserWindow({ width: 820, height: 760 });
  win.webContents.on('console-message', (e) => {
    const msg = e.message ?? '';
    if (msg.startsWith('MEDIABUNNY_REPORT')) {
      console.log(msg);
      if (auto) app.quit();
    }
  });
  win.loadURL('app://local/index.html' + (auto ? '?auto=1' : ''));
});
app.on('window-all-closed', () => app.quit());
