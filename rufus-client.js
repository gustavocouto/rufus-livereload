(function() {
    let wss = {};
    let socketUrl = '';
    let lastMessage = '';

    function logMessage(message) {
        if(message == lastMessage)
            return;

        lastMessage = message;
        console.log(lastMessage);
    }

    function createConnection() {
        wss = new WebSocket(socketUrl);

        wss.addEventListener('open', e => {
            logMessage('[Rufus] Connection is open');
        });

        wss.addEventListener('close', e => {
            logMessage('[Rufus] Connection is closed. Reload page if server is alive');
        });

        wss.addEventListener('message', e => {
            if(e.data == 'reload')
                window.location.reload(true);
        });
    }

    (function() {
        socketUrl = 'ws://localhost:${webSocketPort}/rufus-livereload';
        createConnection();
    })();
})();