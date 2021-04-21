import mongoose from 'mongoose';

const whatsappSchema = mongoose.Schema({
    message: String,
    name: String,
    timeStamp: String,
    received: Boolean
});

const message = mongoose.model("messagecontents", whatsappSchema);

export default message;