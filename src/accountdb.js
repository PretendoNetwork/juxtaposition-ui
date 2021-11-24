const mongoose = require('mongoose');
const { account_db: mongooseConfig } = require('./config.json');
const { uri, database, options } = mongooseConfig;
const logger = require('./logger');

let pnidConnection;

function connect() {
    if(!pnidConnection)
        pnidConnection = makeNewConnection(`${uri}/${database}`, options);
}

function makeNewConnection(uri) {
    //const db = mongoose.createConnection(`${uri}/${database}`, options);
    const db = mongoose.createConnection(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    db.on('error', function (error) {
        logger.error(`MongoDB connection ${this.name} ${JSON.stringify(error)}`);
        db.close().catch(() => console.log(`MongoDB :: failed to close connection ${this.name}`));
    });

    db.on('connected', function () {
        logger.info(`MongoDB connected ${this.name} / ${uri}`);
    });

    db.on('disconnected', function () {
        logger.info(`MongoDB disconnected ${this.name}`);
    });

    return db;
}

pnidConnection = makeNewConnection(`${uri}/${database}`, options);

module.exports = {
    pnidConnection,
    connect
};
