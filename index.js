const { Delete } = require('sppurge');
const { spsave } = require('spsave');
const recursive = require("recursive-readdir");
const gulpWebsocketServer = require('gulp-websocket-server');
const fs = require('fs');
const nodePath = require('path');
const colors = require('colors');
const watch = require('node-watch');
const sppurge = require('sppurge').default;

exports.rufus = config => {
    let fileQueue = [];
    let watchingQueue = false;
    let purge = new Delete();
    let credentials = { username: config.username, password: config.password };

    const log = message => console.log(colors.cyan('[Rufus] ') + message);

    const isDir = path => path.split('/').pop().split('.').length == 1;

    const createWebScoketServer = () => {
        const wssConfig = { port: config.webSocketPort || 8081, path: '/rufus-livereload' };
        const wss = gulpWebsocketServer(wssConfig);
        wss.on('connection', () => log(`Connection detected. Clients (${wss.clients.size}).`));

        return wss;
    }

    const watchQueue = async () => {
        if (watchingQueue) return { mandatory: false };

        watchingQueue = true;
        while (fileQueue.length != 0) {
            const path = fileQueue.pop();
            if (!fs.existsSync(path))
                return;

            await spsave({
                siteUrl: config.sharePointUrl
            }, credentials, {
                glob: path,
                folder: `${config.sharePointFolder}/${nodePath.dirname(path)}`
            });

            log(`${path} uploaded`);
        }

        watchingQueue = false;
        return { mandatory: true };
    };

    const watchFile = async path => {
        if (!fs.existsSync(path)) return;

        (fileQueue.indexOf(path) < 0) && fileQueue.push(path);
        return await watchQueue();
    };

    const watchFolder = async path => {
        if (!fs.existsSync(path)) return;

        const files = await recursive(config.localPath);
        fileQueue.push(...files.filter(file => fileQueue.indexOf(file) < 0));
        return await watchQueue();
    };

    const deletePath = async path => {
        const context = { ...credentials, siteUrl: config.sharePointUrl };
        if (isDir(path))
            await purge.deleteFolder(context, `${config.sharePointFolder}${path && '/'}${path}`).catch(() => { });
        else
            await sppurge(context, { folder: config.sharePointFolder, filePath: path }).catch(() => { });

        log(`${path} deleted`);
    };

    const sync = async () => {
        log('Synchronizing SharePoint...');
        await deletePath('', true);
        await watchFolder(config.localPath);
    };

    const serve = () => new Promise(_ => {
        const wss = createWebScoketServer();
        watch('./src', { recursive: true }, async (e, path) => {
            log(`Working for ${path} ${e} mode`);

            if (e == 'update') {
                const watchResult = await (isDir(path) ? watchFolder : watchFile)(path);
                watchResult.mandatory && wss.send('reload');
            } else if (e == 'remove') {
                await deletePath(path);
                wss.send('reload');
            }
        });

        log(`Rufus is watching ${colors.cyan(config.localPath.cyan)} path, keep working!`);
    });

    return {
        sync,
        serve
    };
}