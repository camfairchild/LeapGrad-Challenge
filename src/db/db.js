"use strict";
require("dotenv").config();

module.exports = function (mongoose) {
    var module = {};

    module.connect = function() {
        mongoose.connect(
            process.env.MONGO_URI,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );
        return mongoose.connection;
    }

    return module;
}