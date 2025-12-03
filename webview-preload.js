const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    sendToHost: (msg) => ipcRenderer.sendToHost(msg)
});
