(function() {
    let wss = {};
    let socketUrl = '';
    let lastMessage = '';
    let connectedOnce = false;

    function logMessage(message) {
        if(message == lastMessage)
            return;

        lastMessage = message;
        console.log(lastMessage);
    }

    function createConnection() {
        wss = new WebSocket(socketUrl);

        wss.addEventListener('open', e => {
            if(connectedOnce)
                return window.location.reload(true);

            connectedOnce = true;
            logMessage('[Rufus livereload] Connection is open!');
        });

        wss.addEventListener('close', e => {
            logMessage('[Rufus livereload] Connection is closed. Waiting for the socket to be alive...');
            setTimeout(createConnection, 1000);
        });

        wss.addEventListener('message', e => {
            if(e.data == 'reload')
                window.location.reload(true);
        });
    }

    window['rufusLivereload'] = function(port) {
        const url = new URL(window.location.href);
        const enableRufus = url.searchParams.get('enableRufus');
        if(!enableRufus)
            return;

        socketUrl = `ws://localhost:${port || 8081}/rufus-livereload`;
        createConnection();
    }
})();