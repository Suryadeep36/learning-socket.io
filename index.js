import express from 'express';
import { createServer} from 'node:http'

const app = express();
let port = process.env.PORT || 3000;
const server = createServer(app);
app.get("/", (req, res) => {
    res.send("Hello World");
})

server.listen(port, () => {
    console.log(`Server running at port ${port}`)
})

