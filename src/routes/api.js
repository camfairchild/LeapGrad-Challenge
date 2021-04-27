import express from "express";
let router = express.Router();

import authRouter from "./user.js";

router.use("/auth", authRouter);

export default router;