import dotenv from 'dotenv'
dotenv.config();
import jwt from "jsonwebtoken";

import { getAllStocks, getUserByUsername } from "../db/db.js";
import Stock from "../models/stock.js";

export default function(io) {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        const authErr = new Error("Invalid token!");

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) next(err);
            if (getUserByUsername(decoded.username)) {
                next();
            } else {
                next(authErr);
            }
        });
    });

    io.sockets.on('connection', (socket) => {
        Stock.schema.on("saved", (doc) => {
            socket.emit("update one", doc);
        })       

        socket.on("update", async (cb) => {
            var arr = await getAllStocks();
            cb(arr);
        });
    });   
}