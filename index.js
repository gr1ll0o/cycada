const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let mainWindow;

ipcMain.on("close-app", () => {
  app.quit();
});

function quitApplication() {
  ipcRenderer.send('quit-app');
}

function createWindow() {
  mainWindow= new BrowserWindow({
    width: 1280,
    height: 720,
    autoHideMenuBar: true,
    useContentSize: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webviewTag: true
    },
  });

  mainWindow.loadFile("index.html");
  mainWindow.webContents.openDevTools();
  mainWindow.webContents.setZoomLevel(1); 
}

app.whenReady().then(() => {
  createWindow();
  mainWindow.webContents.session.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36");
});
