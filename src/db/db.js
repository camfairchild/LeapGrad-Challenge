import mongoose from "mongoose";

import User from "../models/user.js";
import { createUser, checkLogin } from "../user.js";
import { UniqueUserError } from "../errors/UserRegistrationErrors.js";

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
    let user = await createUser(username, password);
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

export function updateBalance(username, amount, done) {
    getUserByUsername(username, (err, user) => {
        if (err) done(err);
        user.balance += amount;
        user.save((err, doc) => {
            if (err) done(err);
            done(err, doc.balance);
        })
    })
}

export function getBalance(username, done) {
    getUserByUsername(username, (err, user) => {
        if (err) throw err;
        done(null, user.balance);
    });
}