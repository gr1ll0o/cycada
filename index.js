const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let mainWindow;

ipcMain.on("close-app", () => {
    app.quit();
});

ipcMain.handle("set-fullscreen", (event, flag) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.setFullScreen(flag);
});


function quitApplication() {
    ipcRenderer.send('quit-app');
}

function createWindow() {
    mainWindow= new BrowserWindow({
        width: 1280,
        height: 720,
        autoHideMenuBar: true,
        frame: false,
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
    // mainWindow.webContents.openDevTools();
    mainWindow.webContents.setZoomLevel(1); 
}

ipcMain.on("maximize-window", () => {
    if (!mainWindow.isMaximized()) mainWindow.maximize();
});

ipcMain.on("unmaximize-window", () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
});

ipcMain.on("toggle-maximize", () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize(); 
    else mainWindow.maximize();
});

app.whenReady().then(() => {
  createWindow();
  mainWindow.webContents.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );
});