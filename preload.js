const { contextBridge, ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
    console.log("DOM listo");
});

contextBridge.exposeInMainWorld("electronAPI", {
  closeApp: () => ipcRenderer.send("close-app"),
});

contextBridge.exposeInMainWorld("electronAPI", {
    setFullscreen: (flag) => ipcRenderer.invoke("set-fullscreen", flag)
});
