import bcrypt from "bcrypt";


import { UserRegistrationError } from "./errors/UserRegistrationErrors.js";
import User from "./models/user.js";

export async function checkLogin(user, password) {
    var hash = user.password_hash;
    
    return await bcrypt.compare(password, hash);
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