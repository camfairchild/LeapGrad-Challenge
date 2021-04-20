import dotenv from 'dotenv'
dotenv.config();

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

export function registerUser(username, password) {
    var saltRounds = 10;
    bcrypt.hash(password, saltRounds, function(err, hash) {
        if (err) throw err;
        // Store hash in your password DB.
        const user = new User({
            username: username,
            password_hash: hash,
            balance: 0,
            portfolio: []
        });

        user.save((err) => {
            if (err) {
                if (err.name === 'MongoError' && err.code === 11000) {
                    // Duplicate username error
                    throw new UniqueUserError("This username is not unique!");
                } else {
                    throw err;
                }
            }
        });
    });
}