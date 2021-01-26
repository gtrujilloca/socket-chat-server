const socketIo = require('socket.io');
const express = require('express');
const http = require('http');

const port = process.env.PORT || 4001;
const routes = require('./routes/index');

const app = express();

app.use(routes);


const server = http.createServer(app);
const io = socketIo(server);

io.on('connection',(socket)=>{
  console.log('new connection');
})

server.listen(port,()=>console.log(`Server on port ${port}`));
