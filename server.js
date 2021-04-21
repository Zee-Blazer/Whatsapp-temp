import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbmessages.js';
import Pusher from 'pusher';
import cors from 'cors';
import dotenv from 'dotenv';
import message from './dbmessages.js';
const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());

const connection_url = "mongodb+srv://admin:P9dvSNg9VMxA9Lv@clusterglite.8yfv3.mongodb.net/message?retryWrites=true&w=majority";
const uri = process.env.ATLAS_URI;

mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('mongo connected'))
     .catch(err => console.log(err));

const pusher = new Pusher({
    appId: "1189067",
    key: "525a9e1fbf4c3154a7b0",
    secret: "51f98af7bd5d9e23245e",
    cluster: "eu",
    useTLS: true
});

const db = mongoose.connection;

db.once('open', () => {
    console.log("DB is Connected");

    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on('change', (change) => {
        console.log(change)

        if(change.operationType === "insert")
        {
            const messageDetails = change.fullDocument;
            pusher.trigger('message', 'inserted', {
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timeStamp,
                received: messageDetails.received
            })
        }
        else{
            console.log("Error occured")
        }
    })
})

app.get('/', (req,res) => {
    res.status(200).send("This is the WhatsApp Application.")
})

app.get('/messages/sync', (req,res) => {
    message.find((err, doc) => {
        if(err) return res.status(500).send(err);
        return res.status(200).send(doc);
    })
})

app.post('/messages/new', (req,res) => {
    const dbMessage = req.body;

    Messages.create(dbMessage, (err, data) => {
        if(err) return res.status(500).send(err);
        return res.status(201).send(`New Message Created: \n ${data}`)
    })
})

const port = process.env.PORT || 9000;

app.listen(port, () => console.log(`Server is running on port ${port}`) );


// Password:> P9dvSNg9VMxA9Lv;