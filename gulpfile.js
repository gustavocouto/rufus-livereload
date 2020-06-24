const { rufus } = require('./index');
const config = require('./rufus.config.json');

config.ignore = async (mode, path) => {
    return false;
};

exports['sync'] = async function() {
    await rufus(config).sync();
};

exports['serve'] = async function() {
    await rufus(config).serve();
};

exports['sync:serve'] = async function() {
    const context = rufus(config);
    await context.sync();
    await context.serve();
}