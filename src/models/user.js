import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema({
    username: { type : String , unique : true, required : true, dropDups: true, index: true },
    password_hash: { type : String , required : true },
    balance: Number,
    portfolio: {
        type: Map,
        of: Number
    }
});
  
export default mongoose.model("User", UserSchema);