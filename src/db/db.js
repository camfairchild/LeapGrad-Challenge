import mongoose from "mongoose";
import bcrypt from "bcrypt";

import User from "../models/user.js";
import { UniqueUserError, UserRegistrationError } from "../errors/UserRegistrationErrors.js";

export function connect(uri) {
    mongoose.connect(
        uri,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    );
    return mongoose.connection;
}

export async function registerUser(username, password) {
    var saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    const user = new User();
    user.username = username;
    user.password_hash = hash;
    user.balance = 0.00;
    user.portfolio = [];
    try {
        var doc = await user.save();
        return doc;
    } catch (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
            // Duplicate username error
            throw new UniqueUserError("This username is not unique!");
        } else {
            throw err;
        }
    }
}

export async function checkLogin(user, password, done) {
    var hash = user.password_hash;
    
    bcrypt.compare(password, hash, (err, same) => {
        if (err) done(err);
        if (same) {
            done(null, user);
        } else {
            done(null, false);
        }
    });
}

export function getUserByUsername(username, done) {
    User.findOne({ "username": username }, (err, doc) => {
        if (err) {
            done(err);
        } else {
            done(null, doc);
        }
    })
}

export async function loginUser(username, password, done) {
    getUserByUsername(username, (err, user) => {
        if (err) {
            // Error
            done(err);
        } else {
            if (!user) {
                // User does not exist
                done(null, false);
            } else {
                // try to login
                checkLogin(user, password, done);
            }
        }
    });
}