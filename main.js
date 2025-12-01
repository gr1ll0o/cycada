// WEB VIEW
const webView = document.getElementById('vista');
const container = document.getElementById('container');

// basic elements
const webInput = document.getElementById('webinput');

// error pages
const nameNotResolved = document.getElementById('name-not-resolved');
const internetDisconnected = document.getElementById('internet-disconnected');
const connectionTimedOut = document.getElementById('connection-timed-out');

/// FUNCTIONS
function hideAllErrors() {
    const errors = document.querySelectorAll('.error-page');
    errors.forEach(err => {
        err.style.display = 'none';
    });
}

function isIP(str) {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(str) && 
           str.split('.').every(n => n >= 0 && n <= 255);
}

/// PROGRAM

webInput.addEventListener('keydown', (event) => {
    let query = webInput.value;
    if (event.key == 'Enter') {
        if (isIP(query)) {
            if (!query.startsWith("http://") && !query.startsWith("https://")) {
                query = "http://" + query;
            }
            webView.src = query;
            return;
        }
        
        if (!query.includes('https://') && !query.includes('http://')) {
            webView.src = 'https://www.google.com/search?q=' + query;
        }else{
            webView.src = query 
        }

        const raw = webView.src;
        const url = new URL(raw);
        webInput.value = url.protocol + "//" + url.hostname;

        hideAllErrors();
        container.style.display = 'block';
    }
});
webInput.addEventListener('click', () => {
    webInput.value = webView.src;
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
            connectionTimedOut.style.display = 'block';
            break;
        case "ERR_CONNECTION_REFUSED":
            connectionTimedOut.style.display = 'block';
            break;
    }    
});

