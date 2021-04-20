import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema({
    username: { type : String , unique : true, required : true, dropDups: true },
    password_hash: { type : String , required : true },
    balance: Number,
    portfolio: [{
        "ticker" : String,
        "amount" : Number
    }]
});
  
export default mongoose.model("User", UserSchema);