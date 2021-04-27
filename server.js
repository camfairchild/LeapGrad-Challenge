import dotenv from 'dotenv'
dotenv.config();
import express from 'express';
import http  from 'http';
import session from "express-session";
import bodyParser from "body-parser";

let app = express();

import passport from 'passport';
import { BasicStrategy } from 'passport-http';



export var server = http.createServer(app);
import { Server as socketIO } from 'socket.io'
const io = new socketIO(server);

import api from './src/routes/api.js';
import { connect, getUserByUsername, loginUser } from './src/db/db.js';

import events from './src/routes/events.js';
import { UserRegistrationError } from './src/errors/UserRegistrationErrors.js';

let port = process.env.PORT || 3000;

let db_connection = connect(process.env.MONGO_URI);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  }))
app.use(passport.initialize());
app.use(passport.session());
app.use('/api', api);

passport.use(new BasicStrategy (
    loginUser
))

passport.deserializeUser((user, done) => {
    getUserByUsername(user.username, done);
});

passport.serializeUser((user, done) => {
    done(null, user.username);
});

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