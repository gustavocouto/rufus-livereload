const { watch } = require('gulp');

function serveTask(cb) {
    const watcher = watch(['src/*.js']);

    watcher.on('change', (path, stats) => {
        console.log(path);
    });
    
    console.log('Watching files, keep working...');

}

exports.serve = serveTask;