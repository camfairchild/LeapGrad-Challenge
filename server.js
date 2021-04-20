import dotenv from 'dotenv'
dotenv.config();
import express from 'express';
import http  from 'http';

const server = http.createServer(app);
import sio from 'socket.io';
const io = sio(server);

import api from './src/routes/api';
import { connect } from './src/db/db';

import events from './src/routes/events';

let app = express();

let port = process.env.PORT || 3000;

let db_connection = connect(process.env.MONGO_URI);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', api);

// log database errors
db_connection.on('error', console.error.bind(console, 'database connection error:'));

db_connection.once('open', () => {
    // On database connection
    io.sockets.on('connection', (socket) => {
        events(socket, io);
    });
    
    // catch 404
    app.use(function(req, res, next) {
        res.status(404).send('Not found');
    });
    
    server.listen(port);
});

module.exports = app;