import mongoose from "mongoose";
const { Schema } = mongoose;

const StockSchema = new Schema({   
        company: { type: String, required: true, unique: true },
        ticker: { type: String, required: true, unique: true, dropDups: true },
        price: { type: Number, required: true }
});

export default mongoose.model('Stock', StockSchema);