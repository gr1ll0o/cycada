// ===========================
// VARIABLES
// ===========================
let history = [];
let pos = -1;
let lastURL = "";

let lastLoadHadError = false;
let currentZoom = 1.0;

// ===========================
// ELEMENTS
// ===========================
const webView = document.getElementById('vista');
const container = document.getElementById('container');

// basic elements
const back = document.querySelector('#back');
const forward = document.querySelector('#forward');
const refresh = document.querySelector('#refresh');
const webInput = document.getElementById('webinput');

const menuIcon = document.getElementById("menu-icon");
const menuBox = document.getElementById("menu-box");
const items = document.querySelectorAll(".menu-item");
const zoomMinus = document.getElementById("zoom-minus");
const zoomPlus = document.getElementById("zoom-plus");
const zoomValue = document.getElementById("zoom-value");

// error pages
const nameNotResolved = document.getElementById('name-not-resolved');
const internetDisconnected = document.getElementById('internet-disconnected');
const connectionTimedOut = document.getElementById('connection-timed-out');
const connectionRefused = document.getElementById('connection-refused');

// ===========================
// FUNCTIONS
// ===========================

document.getElementById("btn-close").addEventListener("click", () => {
    window.electronAPI.closeApp();
});

function startURLWatcher() {
    setInterval(() => {
        const current = webView.getURL();

        if (current && current !== lastURL) {
            console.log("URL cambió internamente:", current);

            handleNavigation(current);
            updateInputWithURL(current);

            lastURL = current;
        }
    }, 300);
}

function isDomain(str) {
    return /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,24}$/.test(str.trim());
}

function hideAllErrors() {
    document.querySelectorAll('.error-page').forEach(err => {
        err.style.display = 'none';
    });
    document.getElementById('main-page').style.display = 'none';
}

function isIP(str) {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(str) &&
           str.split('.').every(n => n >= 0 && n <= 255);
}

function updateInputWithURL(raw) {
    try {
        const url = new URL(raw);
        webInput.value = url.href;
    } catch {
        webInput.value = raw;
    }
}

function updateButtons() {
    back.disabled = (pos <= 0);
    forward.disabled = (pos >= history.length - 1);
}

function normalizeURL(raw) {
    try {
        const u = new URL(raw);
        return u.origin + u.pathname;
    } catch {
        return raw;
    }
}

function addToHistory(url) {
    if (pos < history.length - 1) {
        history = history.slice(0, pos + 1);
    }

    history.push(url);
    pos = history.length - 1;

    updateButtons();
}

function handleNavigation(url) {
    if (pos === -1) {
        addToHistory(url);
        return;
    }

    const last = history[pos];
    const current = url;

    if (last !== current) {
        addToHistory(url);
    }
}

function web(query) {
    webInput.blur();

    let finalURL = query;

    if (query == "cycada:settings") {
        finalURL = "assets/html/preferences.html"
    }else if (query == "cycada:home") {
        container.style.display = 'none';
        document.body.style.backgroundImage = "url('assets/bg.jpg')";
        document.body.style.backgroundSize = "cover";
        document.getElementById('main-page').style.display = 'block';
        webView.src = '';
        return;
    }else if (isIP(query)) { // IP or protocol 
        if (!query.startsWith("http://") && !query.startsWith("https://")) {
            finalURL = "http://" + query;
        }
    }else if (isDomain(query)) {
        console.log(isDomain(query));
        if (!query.startsWith("http://") && !query.startsWith("https://")) {
            finalURL = "https://" + query;
        }
    }else if (!query.startsWith("http://") && !query.startsWith("https://")) { // Text without protocol
        finalURL = "https://www.google.com/search?q=" + query;
    }

    webView.src = finalURL;

    updateInputWithURL(finalURL);
    hideAllErrors();
    container.style.display = 'block';
    document.body.style.background = 'none';
    document.body.style.backgroundColor = '#222';
}

function updateZoomDisplay() {
    zoomValue.textContent = Math.round(currentZoom * 100) + "%";
}

function quit() {
    ipcRenderer.send('quit-app');
}

// ===========================
// PROGRAM
// ===========================

const mainInput = document.getElementById('main-input');
mainInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        web(mainInput.value);
    }
});

// HIDE / SHOW MENUBOX
menuIcon.addEventListener("click", (ev) => {
    ev.stopPropagation();
    menuBox.style.display = menuBox.style.display === "block" ? "none" : "block";
});
document.addEventListener("click", (ev) => {
    if (ev.target !== menuIcon && !menuBox.contains(ev.target)) {
        menuBox.style.display = "none";
    }
});

// DONT HIDE THE MENUBOX IF PARTICULAR ITEM PRESSED
document.getElementById("zoom-item").addEventListener("click", (e) => { e.stopPropagation(); });

// ACTIONS OF MENUBOX
items.forEach(item => {
    item.addEventListener("click", () => {
        const action = item.dataset.action;
        console.log("Elegiste:", action);
        menuBox.style.display = "none";

        // EXAMPLE
        if (action === "preferences") web("cycada:settings");
        if (action === "home") web("cycada:home");
    });
});

/// ========================
///   ZOOM
/// ========================
zoomPlus.addEventListener('click', (e) => {
    e.stopPropagation();
    currentZoom += 0.1;
    webView.setZoomFactor(currentZoom);
    updateZoomDisplay();
});

zoomMinus.addEventListener('click', (e) => {
    e.stopPropagation();
    currentZoom -= 0.1;
    webView.setZoomFactor(currentZoom);
    updateZoomDisplay();
});
/////////////////////////////////////

webInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        web(webInput.value);
    }
});

webInput.addEventListener('click', () => {
    webInput.value = webView.src;
    webInput.select();
});

webView.addEventListener("dom-ready", () => {
    console.log("Webview listo");

    startURLWatcher();
});

webView.addEventListener('did-fail-load', (event) => {
    container.style.display = 'none';
    hideAllErrors();

    switch (event.errorDescription) {
        case "ERR_NAME_NOT_RESOLVED":
            nameNotResolved.style.display = 'block';
            break;
        case "ERR_INTERNET_DISCONNECTED":
            internetDisconnected.style.display = 'block';
            break;
        case "ERR_CONNECTION_TIMED_OUT":
            connectionTimedOut.style.display = 'block';
            break;
        case "ERR_CONNECTION_REFUSED":
            connectionRefused.style.display = 'block';
            break;
    }
    lastLoadHadError = true;
});

webView.addEventListener('did-navigate-in-page', (event) => {
    //console.log("URL interna cambió:", event.url);
    console.log(history);
    handleNavigation(event.url);
    updateButtons();
    webView.setZoomFactor(currentZoom);
    back.disabled = true;
    forward.disable = true;
    zoomPlus.disable = true;
    zoomMinus.disable = true;
    container.style.display = 'block';
    webInput.value = event.url;
    webInput.value = webView.src;
});

webView.addEventListener("did-stop-loading", () => {
    if (lastLoadHadError) {
        console.log("Hubo un error al cargar la página");

        // Reset para la próxima carga
        lastLoadHadError = false;
        return;
    }else { container.style.display = 'block'; }
    console.log("Loaded page");
    webView.setZoomFactor(currentZoom);
    back.disabled = false;
    forward.disable = false;
    zoomPlus.disable = false;
    zoomMinus.disable = false;
});

webView.addEventListener("enter-html-full-screen", () => {
    window.electronAPI.setFullscreen(true);
});

webView.addEventListener("leave-html-full-screen", () => {
    window.electronAPI.setFullscreen(false);
});


// ===========================
// BUTTONS
// ===========================

back.addEventListener('click', () => {
    if (pos > 0) {
        pos--;
        webView.src = history[pos];
        updateInputWithURL(history[pos]);
        hideAllErrors();
        container.style.display = 'block';
        updateButtons();
    }
});

forward.addEventListener('click', () => {
    if (pos < history.length - 1) {
        pos++;
        webView.src = history[pos];
        updateInputWithURL(history[pos]);
        hideAllErrors();
        container.style.display = 'block';
        updateButtons();
    }
});

refresh.addEventListener('click', () => {
    webView.reload();
});

//   INIT
webInput.value = "Busca en Google o ingrese dirección";
zoomPlus.disable = true;
zoomMinus.disable = true;