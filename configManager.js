const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "config.json");

// DEFAULT CONFIG
const defaultConfig = {
  theme: "dark",
  homepage: "https://google.com",
  zoom: 1.0
};

function loadConfig() {
  try { // try to read
    const data = fs.readFileSync(configPath, "utf8");
    return JSON.parse(data);
  } catch (err) { // If err, create a new config.json
    console.warn("No se pudo leer config.json, creando uno nuevo...");
    fs.writeFileSync(
      configPath,
      JSON.stringify(defaultConfig, null, 2),
      "utf8"
    );
    return defaultConfig;
  }
}

module.exports = { loadConfig, configPath };
