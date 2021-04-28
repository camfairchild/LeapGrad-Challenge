import mongoose from "mongoose";

import User from "../models/user.js";
import Stock from "../models/stock.js";
import { createUser, checkLogin } from "../user.js";
import { addStock, removeStock, getPortfolio } from "../stock.js";
import { UniqueUserError } from "../errors/UserRegistrationErrors.js";
import { OutOfStockError, NonWholeStockQuantityError, OutOfFundsError, StockError } from "../errors/StockErrors.js";

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

async function updateBalance(user, amount) {
    user.balance += amount;
    let user_ = await user.save()
    return user_.balance;
}

export async function updateBalanceByUsername(username, amount) {
    var user = await getUserByUsername(username);
    return updateBalance(user, amount);
}

function getBalance(user) {
    return user.balance;
}

export async function getBalanceByUsername(username) {
    let user = await getUserByUsername(username);
    return getBalance(user);
}

export async function getStockByTicker(ticker) {
    return await Stock.findOne({ ticker: ticker });
}

export async function getPortfolioByUsername(username) {
    var user = await getUserByUsername(username);
    return getPortfolio(user);
}


export async function buyStock(username, ticker, amount) {
    var user = await getUserByUsername(username);
    var stock = await getStockByTicker(ticker);
    var cost = amount * stock.price;
    if (user.balance >= cost) {
        addStock(user, ticker, amount); // add stock to portfolio
        await updateBalance(user, cost * -1); // decrease balance
    } else {
        throw new OutOfFundsError("Your balance isn't high enough!");
    }
}


export async function sellStock(username, ticker, amount) {
    var user = await getUserByUsername(username);
    var stock = await getStockByTicker(ticker);
    var cost = amount * stock.price;
    removeStock(user, ticker, amount); // remove stock from portfolio
    await updateBalance(user, cost); // increase balance
}