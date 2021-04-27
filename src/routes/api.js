import express from "express";
let router = express.Router();

import authRouter from "./auth.js";
import accountRouter from "./account.js";

router.use("/auth", authRouter);

router.use("/account", accountRouter);

export default router;