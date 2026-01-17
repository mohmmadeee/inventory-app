const { app, BrowserWindow } = require("electron");
const path = require("path");

// Only enable reload in development
try {
  require("electron-reload")(__dirname, {
    electron: path.join(
      __dirname,
      "node_modules",
      ".bin",
      process.platform === "win32" ? "electron.cmd" : "electron"
    ),
  });
} catch (err) {
  // electron-reload not available in production build
}

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile("index.html");
}

app.whenReady().then(createWindow);

// Quit app when all windows are closed (Windows behavior)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
