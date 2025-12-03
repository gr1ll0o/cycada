const { contextBridge, ipcRenderer } = require("electron");
const path = require("path");
const fs = require("fs");
const configPath = path.join(process.cwd(), "config.json");

contextBridge.exposeInMainWorld("electronAPI", {
    readConfig: async () => {
        try {
            const data = await fs.promises.readFile(configPath, "utf8");
            return JSON.parse(data);
        } catch {
            return null;
        }
    },

    saveConfig: async (data) => {
        await fs.promises.writeFile(
            configPath,
            JSON.stringify(data, null, 2),
            "utf8"
        );
    },
    closeApp: () => ipcRenderer.send("close-app"),
    setFullscreen: (flag) => ipcRenderer.invoke("set-fullscreen", flag),
    sendToHost: (msg) => ipcRenderer.sendToHost(msg)
});

window.addEventListener("DOMContentLoaded", () => {
    console.log("DOM listo");
});