"use strict";
require('dotenv').config();
let express = require('express');
const http = require('http');

const server = http.createServer(app);
const io = require('socket.io')(server);

let api = require('./src/routes/api');
let db = require('./src/db/db');

let app = express();

let port = process.env.PORT || 3000;

let db_connection = db.connect();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', api);

// log database errors
db_connection.on('error', console.error.bind(console, 'database connection error:'));

db_connection.once('open', () => {
    // On database connection
    io.sockets.on('connection', (socket) => {
        require('./src/routes/events')(socket, io);
    });
    
    // catch 404
    app.use(function(req, res, next) {
        res.status(404).send('Not found');
    });
    
    server.listen(port);
});

module.exports = app;