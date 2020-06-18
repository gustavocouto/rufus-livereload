const { watch, gulp, src } = require('gulp');
const { Delete } = require('sppurge');
const color = require('gulp-color');
const spsave = require('gulp-spsave');
const sppurge = require('sppurge').default;
const gulpWebsocketServer = require('gulp-websocket-server');
const path = require('path');
const fs = require('fs');

let config = require('./rufus.config.json');
let credentials = {
    username: config.username,
    password: config.password
};

function log(message) {
    console.log(color('[Rufus] ', 'CYAN') + message);
}

function isChildOf(root, path) {
    return path.startsWith(root);
}

function getDiff(date1, date2) {
    return Math.abs(date1 - date2);
}

function createRufusLivereload() {
    const wssConfig = { port: config.webSocketPort || 8081, path: '/rufus-livereload' };
    const wss = gulpWebsocketServer(wssConfig);
    wss.on('connection', () => log(`Connection detected. Clients (${wss.clients.size}).`));

    return wss;
}

async function deletePath(path, isFolder) {
    let promise = null;
    const context = {
        ...credentials,
        siteUrl: config.sharePointUrl
    };

    if (isFolder) {
        const relativeUrl = `${config.sharePointFolder}${path && '/'}${path}`;
        promise = (new Delete()).deleteFolder(context, relativeUrl);
    } else {
        promise = sppurge(context, {
            folder: config.sharePointFolder,
            filePath: path
        });
    }

    await promise.then(() => log(`${path} deleted`));
}

async function addPath(path) {
    src(path).pipe(spsave({
        siteUrl: config.sharePointUrl,
        folder: config.sharePointFolder,
        flatten: true,
        verbose: false
    }, credentials))
}

async function syncSp() {
    log('Synchronizing SharePoint...')
    await deletePath('', true);
    await addPath(config.siteRootFolder)
}

async function rufusTask() {
    if (config.syncBefore)
        await syncSp();

    createRufusLivereload();
    var wacther = watch(config.localPath);
    let lastAction = { path: '', type: '', date: new Date() };

    wacther.on('raw', async (action, name, targetFolder) => {
        const date = new Date();
        const path = `./${targetFolder.watchedPath}/${name}`;
        const type = fs.existsSync(path) ? 'add' : 'delete';

        if (path == undefined || type == undefined)
            return;
        if (lastAction.path == path && lastAction.type == type)
            return;
        if (lastAction.path == targetFolder.watchedPath && lastAction.type == type)
            return;
        if (isChildOf(lastAction.path, path) && (lastAction.type == type) && getDiff(date, lastAction.date) <= 1000)
            return;

        lastAction = { path: path, type: type, date: new Date() };
        if (type == 'add') {
            await addPath(path);
        } else {
            const targetSegments = ePath.split('/').pop().split('.');
            await deletePath(ePath, targetSegments.length == 1);
        }
    });

    log(`Rufus is watching ${color(config.localPath, 'CYAN')} path, keep working!`);
}

exports.rufus = rufusTask;