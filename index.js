import express from 'express';
import { createServer} from 'node:http'
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { Server } from 'socket.io';
const app = express();

const server = createServer(app);
const __dirname = fileURLToPath(import.meta.url);
const io = new Server(server);
let port = process.env.PORT || 3000;
app.set('view engine', 'ejs');
let users = [];
function getUsernameById(userId) {
    const user = users.find(user => user.id === userId);
    return user ? user : {
        username: "Unknown",
        id: userId,
        isOnline: true
    };
}

app.get("/", (req, res) => {
    res.sendFile(join(__dirname, '../index.html'));
})
app.get("/users",(req ,res) => {
    res.render('users',{
        data: users
    })
})
io.on('connection',(socket) =>{ 
    socket.on('add new user',(msg) => {
        let newUser = {
            username: msg,
            id: socket.id,
            isOnline: true
        }
        users.push(newUser);
        let foundUser = getUsernameById(socket.id);
        io.emit('user connected',foundUser)
    })

    socket.on('typing',(msg) => {
        let foundUser = getUsernameById(socket.id);
        if(msg){
            msg = `${foundUser.username} is typing`
        }
        else{
            msg = "";
        }
        io.emit('typing', msg);
    })
    socket.on('chat message',(msg) => {
        let foundUser = getUsernameById(socket.id);
        let msgInfo = {
            username: foundUser.username,
            id: foundUser.id,
            message: msg
        } 
        io.emit('chat message',msgInfo)
    })
    socket.on('disconnect',() =>{
        let foundUser = getUsernameById(socket.id);
        foundUser.isOnline = false;
        io.emit('user disconnected',foundUser);
    })
    
})

server.listen(port, () => {
    console.log(`Server running at port ${port}`)
})

