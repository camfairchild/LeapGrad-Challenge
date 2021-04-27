import dotenv from 'dotenv'
dotenv.config();
import express from 'express';
import http  from 'http';

let app = express();

import passport from 'passport';
import { Strategy } from 'passport-local';

import { Strategy as JWTstrategy, ExtractJwt } from 'passport-jwt';

export var server = http.createServer(app);
import { Server as socketIO } from 'socket.io'
const io = new socketIO(server);

import api from './src/routes/api.js';
import { connect, getUserByUsername, registerUser, loginUser } from './src/db/db.js';

import events from './src/routes/events.js';

let port = process.env.PORT || 3000;

let db_connection;
if (process.env.NODE_ENV === "test") {
    db_connection = connect(process.env.MONGO_URI_test);
} else {
    db_connection = connect(process.env.MONGO_URI_prod);
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use('/api', api);

passport.use('register', new Strategy ({
      usernameField: 'username',
      passwordField: 'password'
    },
    (username, password, done) => {
        registerUser(username, password).then((user) => {
            done(null, user);
        }).catch((err) => {
            done(err);
        });
    }
));

passport.use('login', new Strategy ({
    usernameField: 'username',
    passwordField: 'password'
  },
  (username, password, done) => {
      loginUser(username, password, (err, user) => {
          done(err, user);
      });
  }
));

passport.use(new JWTstrategy(
    {
        secretOrKey: process.env.JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromUrlQueryParameter("token")
    },
    async (token, done) => {
        try {
            done(null, token.user);
        } catch (err) {
            done(err);
        }
    }
))

passport.deserializeUser((username, done) => {
    getUserByUsername(username, done);
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