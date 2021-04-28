import express from "express";
let router = express.Router();

import passport from "passport";

import { updateBalanceByUsername, getBalanceByUsername, getPortfolioByUsername, buyStock, sellStock, getStockByTicker } from "../db/db.js";
import { TickerDoesNotExistError, StockError } from "../errors/StockErrors.js";

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

router.use(passport.authenticate('jwt', { session: false }));

router.route('/balance')
    .get((req, res) => {
        getBalanceByUsername(req.user.username).then((balance) => {
            res.status(200).json({
                    balance: balance
            })
        }).catch((err) => {
            res.status(500).json(err);
        })
    })
    .post((req, res) => {
        if (!req.body.amount || !isNumeric(req.body.amount)) {
            res.status(422).json(
                { error: "Invalid amount" }
            )
        } else {
            updateBalanceByUsername(req.user.username, parseFloat(req.body.amount)).then((balance) => {      
                res.status(200).json({
                    balance: balance
                })
            }).catch((err) => {
                res.status(500).json(err);
            })
        }
    })

router.route('/portfolio')
        .get(async (req, res) => {
            var username = req.user.username;
            var portfolio = await getPortfolioByUsername(username);
            res.status(200).json({ portfolio });
        })

router.route('/portfolio/buy')
        .post((req, res) => {
            var username = req.user.username;
            var ticker = req.body.ticker;
            var amount = req.body.amount;
            getStockByTicker(ticker).then((stock) => {
                buyStock(username, ticker, amount).then(() => {
                    res.status(200).send({ message: "Success!", action: "BUY", stock: stock, amount: amount });
                }).catch((err) => {
                    if (err instanceof StockError) {
                        res.status(200).json({
                            error: err.message
                        });
                    } else {
                        res.status(500).json(err);
                    }
                })
            }).catch((err) => {
                if (err instanceof TickerDoesNotExistError) {
                    res.status(200).json({
                        error: err.message
                    });
                } else {
                    res.status(500).json(err);
                }
            })
        })

router.route('/portfolio/sell')
        .post((req, res) => {
            var username = req.user.username;
            var ticker = req.body.ticker;
            var amount = req.body.amount;
            getStockByTicker(ticker).then((stock) => {
                sellStock(username, ticker, amount).then(() => {
                    res.status(200).send({ message: "Success!", action: "SELL", stock: stock, amount: amount });
                }).catch((err) => {
                    if (err instanceof StockError) {
                        res.status(200).json({
                            error: err.message
                        });
                    } else {
                        res.status(500).json(err);
                    }
                })
            }).catch((err) => {
                if (err instanceof TickerDoesNotExistError) {
                    res.status(200).json({
                        error: err.message
                    });
                } else {
                    res.status(500).json(err);
                }
            })
        })
export default router;