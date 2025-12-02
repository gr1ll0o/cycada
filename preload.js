const { contextBridge, ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
    console.log("DOM listo");
});

contextBridge.exposeInMainWorld("electronAPI", {
  closeApp: () => ipcRenderer.send("close-app"),
});
