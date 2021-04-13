"use strict";
require("dotenv").config();

let mongoose = require('mongoose');

module.exports = () => {
    function connect() {
        mongoose.connect(
            process.env.MONGO_URI,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );
        return mongoose.connection;
    }
}