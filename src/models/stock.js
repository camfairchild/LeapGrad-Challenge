import mongoose, { Schema } from "mongoose";

const StockSchema = new Schema(
    {   
        company: { type: String, required: true, unique: true },
        ticker: { type: String, required: true, unique: true, dropDups: true },
        price: { type: Number, required: true }
    }
);

module.exports = mongoose.model('Stock', StockSchema);