import express from "express";
let router = express.Router();

import passport from "passport";
import jwt from "jsonwebtoken";

router.post('/register',
        passport.authenticate('register', { session: false, failWithError: true }),
        async (req, res, next) => {
            res.json({
                message: "Registration successful!",
                user: req.user
            });
        },
        async (err, req, res, next) => {
            res.status(422).json({
                error: "Registration unsuccessful"
            });
        });

router.post('/login',
    async (req, res, next) => {
        passport.authenticate('login',
        async (err, user, info) => {
            try {
                if (err) {
                    return res.status(500).json({ error: err });
                } else if (!user) {
                    return res.status(401).json({ error: "Incorrect credentials" });
                } else {
                    req.login(user, { session: false },
                        async (err) => {
                            if (err) return next(err);

                            const body = {
                                _id: user._id,
                                username: user.username
                            }
                            const token = jwt.sign({ user: body }, process.env.JWT_SECRET);
                            return res.json({ token });
                        });
                }
            } catch (err) {
                return next(err);
            }
        })(req, res, next);
});

export default router;