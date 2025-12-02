/// -- GRAL. VARIABLES --
let history = ["https://google.com"];
let pos = 0;

/// -- ELEMENTS --
// WEB VIEW
const webView = document.getElementById('vista');
const container = document.getElementById('container');

// basic elements
const back = document.querySelector('#back');
const forward = document.querySelector('#forward');
const refresh = document.querySelector('#refresh');
const webInput = document.getElementById('webinput');

// deshabilitar botones de inicio
back.disabled = true;
forward.disabled = true;

// error pages
const nameNotResolved = document.getElementById('name-not-resolved');
const internetDisconnected = document.getElementById('internet-disconnected');
const connectionTimedOut = document.getElementById('connection-timed-out');


/// -- FUNCTIONS --
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
        webInput.value = url.protocol + "//" + url.hostname;
    } catch {
        webInput.value = raw;
    }
}

function updateButtons() {
    back.disabled = (pos <= 0);
    forward.disabled = (pos >= history.length - 1);
}

function web(query) {
    webInput.blur();
    document.body.style.background = 'none';
    document.body.style.backgroundColor = '#555';

    let finalURL = query;

    if (isIP(query)) {
        if (!query.startsWith("http://") && !query.startsWith("https://")) {
            finalURL = "http://" + query;
        }
    }
    else if (!query.startsWith("http://") && !query.startsWith("https://")) {
        finalURL = "https://www.google.com/search?q=" + query;
    }

    if (pos < history.length - 1) {
        history = history.slice(0, pos + 1);
    }

    webView.src = finalURL;

    history.push(finalURL);
    pos = history.length - 1;

    updateButtons();
    updateInputWithURL(finalURL);
    hideAllErrors();
    container.style.display = 'block';
}

/// -- PROGRAM --

mainInput = document.getElementById('main-input');
mainInput.addEventListener('keydown', (event) => {
    let query = mainInput.value;

    if (event.key === 'Enter') {
        web(query)
    }
})

webInput.addEventListener('keydown', (event) => {
    let query = webInput.value;

    if (event.key === 'Enter') {
        web(query)
    }
});

webInput.addEventListener('click', () => {
    webInput.value = webView.src;
    webInput.select();
});

webView.addEventListener('did-fail-load', (event) => {
    container.style.display = 'none';
    hideAllErrors();
    console.log("did-fail-load:", event.errorDescription);

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

win.webContents.on('did-fail-load', (e, code, desc, url) => {
    if (code === -3) return; // navegación abortada → ignorar
    console.log('falló, recargando en 300ms:', desc);
    setTimeout(() => win.loadURL(url), 300);
});


// -- BACK --
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

// -- FORWARD --
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

// -- REFRESH --
refresh.addEventListener('click', () => {
    webView.reload();
});

// Init
webInput.value = "welcome";
webView.setZoomFactor(1);
