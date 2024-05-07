import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: String,
    id: String,
    isOnline: Boolean
})

const User = mongoose.model('user',userSchema);

export default User;