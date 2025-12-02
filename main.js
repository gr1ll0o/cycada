// ===========================
// VARIABLES
// ===========================
let history = [];
let pos = -1;

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

// error pages
const nameNotResolved = document.getElementById('name-not-resolved');
const internetDisconnected = document.getElementById('internet-disconnected');
const connectionTimedOut = document.getElementById('connection-timed-out');

// ===========================
// FUNCTIONS
// ===========================

document.getElementById("btn-close").addEventListener("click", () => {
    window.electronAPI.closeApp();
});

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

    // IP or protocol
    if (isIP(query)) {
        if (!query.startsWith("http://") && !query.startsWith("https://")) {
            finalURL = "http://" + query;
        }
    }
    // Text without protocol
    else if (!query.startsWith("http://") && !query.startsWith("https://")) {
        finalURL = "https://www.google.com/search?q=" + query;
    }

    webView.src = finalURL;

    updateInputWithURL(finalURL);
    hideAllErrors();
    container.style.display = 'block';
    document.body.style.background = 'none';
    document.body.style.backgroundColor = '#333';
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

webInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        web(webInput.value);
    }
});

webInput.addEventListener('click', () => {
    webInput.value = webView.src;
    webInput.select();
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
        case "ERR_CONNECTION_REFUSED":
            connectionTimedOut.style.display = 'block';
            break;
    }
});

webView.addEventListener('did-navigate-in-page', (event) => {
    //console.log("URL interna cambió:", event.url);
    console.log(history);
    handleNavigation(event.url);
    updateButtons();
    webInput.value = webView.src;
    back.disabled = true;
    forward.disable = true;
});

webView.addEventListener("did-stop-loading", () => {
    console.log("Cargó al 100%");
    back.disabled = false;
    forward.disable = false;
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
webInput.value = "welcome";
