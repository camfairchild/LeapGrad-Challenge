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
        console.log("connected!!");
        // listen for changed event
        // emit updated doc to socket
        Stock.schema.on("changed", (doc) => {
            socket.emit("update one", doc);
        })       

        socket.on("update", async (cb) => {
            var arr = await getAllStocks();
            cb(arr);
        });

        socket.on("new", async () => {
            var t = new Stock({
                company: "test",
                ticker: "TEST",
                price: 2.00
            });
            
            await t.save();

            var f = new Stock({
                company: "free",
                ticker: "FREE",
                price: 0.00
            });

            await f.save();
        });

        socket.on("change", (price) => {
            Stock.findOne({ ticker: "TEST" }, (err, doc) => {
                doc.price = price;
                doc.save();
            })
        })
    });   
}