import express from 'express';
import { createServer} from 'node:http'
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import User from './models/user.js';
const app = express();

const server = createServer(app);
const __dirname = fileURLToPath(import.meta.url);
const io = new Server(server);
let port = process.env.PORT || 3000;
app.set('view engine', 'ejs');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/test');
}
let users = [];
async function getUsernameById(userId) {
    try{
        let foundUser =  await User.findOne({
            id: userId
        })
        if(foundUser){
            return foundUser;
        }
        else{
            return {
                username: "Unknown",
                id: userId,
                isOnline: true
            }; 
        }
    }
    catch(e){
        console.log("Error occurred while geting username ID: ", e);
        return {
            username: "Unknown",
            id: userId,
            isOnline: true
        };
    }
}

app.get("/", (req, res) => {
    res.sendFile(join(__dirname, '../index.html'));
})
app.get("/users",(req ,res) => {
    User.find({}).then((userList) => {
        res.render('users',{
            data: userList
        })
    })
})
io.on('connection',(socket) =>{ 
    socket.on('add new user', async (msg) => {
        const newUser = new User({
            username: msg,
            id: socket.id,
            isOnline: true
        })
        await newUser.save();
        getUsernameById(socket.id).then((foundUser) => {
            io.emit('user connected',foundUser)
        })
    })

    socket.on('typing',(msg) => {
        getUsernameById(socket.id).then((foundUser) => {
            if(msg){
                msg = `${foundUser.username} is typing`
            }
            else{
                msg = "";
            }
            io.emit('typing', msg);
        })
    })
    socket.on('chat message',(msg) => {
        getUsernameById(socket.id).then((foundUser) => {
            let msgInfo = {
                username: foundUser.username,
                id: foundUser.id,
                message: msg
            } 
            io.emit('chat message',msgInfo)
        })       
    })
    socket.on('disconnect',() =>{
        getUsernameById(socket.id).then((foundUser) => {
            foundUser.isOnline = false;
            foundUser.save();
            io.emit('user disconnected',foundUser);
        })
    })
})

server.listen(port, () => {
    console.log(`Server running at port ${port}`)
})

