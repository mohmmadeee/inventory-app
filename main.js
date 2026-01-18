const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

// Only enable reload in development
try {
  require("electron-reload")(__dirname, {
    electron: path.join(
      __dirname,
      "node_modules",
      ".bin",
      process.platform === "win32" ? "electron.cmd" : "electron",
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

// IPC handler for confirmation dialogs
ipcMain.handle("show-confirm-dialog", async (event, message) => {
  const result = await dialog.showMessageBox({
    type: "question",
    buttons: ["نعم", "إلغاء"],
    message: message,
    defaultId: 1,
    cancelId: 1, // Make sure X button behaves like Cancel button
  });
  return result.response === 0; // true ONLY if "نعم" clicked
});

// Quit app when all windows are closed (Windows behavior)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
