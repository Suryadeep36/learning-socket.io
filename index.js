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

app.get("/", (req, res) => {
    res.sendFile(join(__dirname, '../index.html'));
})

io.on('connection',(socket) =>{ 
    io.emit('user connected',"New user joined");
    socket.on('chat message',(msg) => {
        io.emit('chat message',msg)
    })
    socket.on('disconnect',() =>{
        io.emit('user disconnected', "User left the chat");
    })
})

server.listen(port, () => {
    console.log(`Server running at port ${port}`)
})

