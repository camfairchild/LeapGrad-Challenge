"use strict";
require('dotenv').config();
let express = require('express');
let fs = require('fs');
let { createServer } = require('https');
const sio = require('socket.io');

let api = require('./src/routes/api');
let db = require('./src/db/db');

let app = express();

const server = createServer({
    key: fs.readFileSync(process.env.KEY_PATH),
    cert: fs.readFileSync(process.env.CRT_PATH)
}, app);
const io = sio.listen(server);

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

        return io;
    });

    app.listen(port);
    // catch 404
    app.use(function(req, res, next) {
        res.status(404);

        if (req.accepts('json')) {
          res.json({ error: 'Not found' });
          return;
        }
    
        res.type('txt').send('Not found');
    });
});

module.exports = app;