import bcrypt from "bcrypt";


import { UserRegistrationError } from "./errors/UserRegistrationErrors.js";
import User from "./models/user.js";

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

export async function createUser(username, password) {
    var saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    const user = new User();
    if (username === "") {
        throw new UserRegistrationError("ERROR: Can't have an empty username!");
    }
    user.username = username;
    user.password_hash = hash;
    user.balance = 0.00;
    user.portfolio = [];
    return user;
}