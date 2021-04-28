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
        return await user.save();
    } catch (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
            // Duplicate username error
            throw new UniqueUserError("This username is not unique!");
        } else {
            throw err;
        }
    }
}

export async function getUserByUsername(username) {
    return await User.findOne({ "username": username });
}

export function loginUser(username, password, done) {
    getUserByUsername(username).then((user) => {
        if (!user) {
            // User does not exist
            done(null, false);
        } else {
            // try to login
            checkLogin(user, password).then((result) => {
                if (result) {
                    done(null, user);
                } else {
                    done(null, false);
                }
            }).catch((err) => {
                done(err);
            })
        }
    }).catch((err) => {
        done(err);
    })
}

export async function updateBalance(username, amount) {
    var user = await getUserByUsername(username);
    user.balance += amount;
    let user_ = await user.save()
    return user_.balance;
}

export async function getBalance(username) {
    let user = await getUserByUsername(username);
    return user.balance;
}

export function getStockByTicker(ticker) {}