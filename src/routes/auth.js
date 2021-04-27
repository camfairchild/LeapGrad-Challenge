import express from "express";
let router = express.Router();

import passport from "passport";
import jwt from "jsonwebtoken";

router.post('/register',
        passport.authenticate('register', { session: false }),
        async (req, res, next) => {
            res.json({
                message: "Registration successful!",
                user: req.user
            });
        });

router.post('/login',
    async (req, res, next) => {
        passport.authenticate('login',
        async (err, user, info) => {
            try {
                if (err) {
                    return next(err);
                } else if (!user) {
                    return next(new Error("An error has occurred!"));
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