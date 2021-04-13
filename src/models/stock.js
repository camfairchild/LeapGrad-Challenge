const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StockSchema = new Schema(
    {   
        company: { type: String, required: true },
        ticker: { type: String, required: true },
        price: { type: Number, required: true }
    }
);

module.exports = mongoose.model('stock', StockSchema);