let webView = document.getElementById('vista');

let webInput = document.getElementById('webinput');

webinput.addEventListener('keydown', (event) => {
    let query = webInput.value
    if (event.key == 'Enter') {
        if (!query.includes('https://')) {
            webView.src = 'https://www.google.com/search?q=' + query
        }else{
            try { webView.src = query } catch (error) { console.log("ERROR: " + error) }
        }
    }
});