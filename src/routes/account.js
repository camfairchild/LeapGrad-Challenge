import express from "express";
let router = express.Router();

import passport from "passport";

import { updateBalance, getBalance } from "../db/db.js";

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

router.use(passport.authenticate('jwt', { session: false }));

router.route('/balance')
    .get((req, res) => {
        getBalance(req.user.username).then((balance) => {
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
            updateBalance(req.user.username, parseFloat(req.body.amount)).then((balance) => {      
                res.status(200).json({
                    balance: balance
                })
            }).catch((err) => {
                res.status(500).json(err);
            })
        }
    })

export default router;