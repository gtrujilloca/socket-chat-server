const socketIo = require('socket.io');
const express = require('express');
const http = require('http');
const cors = require('cors');

const port = process.env.PORT || 4001;
const routes = require('./routes/index');

const app = express();

app.use(routes);
app.use(cors());


const server = http.createServer(app);
const io = socketIo(server);

let totalUsers = {}
let lastMessages = {}

io.on('connection',(socket)=>{
  console.log('new connection');
  joinUser(socket);
  chatMessage(socket);
  leaveUser(socket);
})

const joinUser = (socket) => {
  socket.on('joinUser',(username,room) => {
    console.log(`Ingreso ${username} en la sala ${room}`);
    socket.join(room);
    socket.username = username;
    socket.room = room;

    totalUsers[room] = !totalUsers[room] ? 1 : ++totalUsers[room];

    io.to(room).emit('join',{
      totalUsers : totalUsers[room],
      lastMessages: lastMessages[room]
    })

    // socket.broadcast.to(socket.room).emit('joinUserGlobal',{
    //   username: socket.username,
    //   room: socket.room,
    //   totalUsers:totalUsers[room]
    // });
  })
}

const leaveUser = (socket) =>{
  socket.on('disconnect', ()=>{
    --totalUsers[socket.room]

    io.to(socket.room).emit('leaveUser',{
      username: socket.username,
      room: socket.room,
      totalUsers : totalUsers[socket.room],
    })
  })
}

const chatMessage = (socket) =>{
  socket.on('sendMessage',(message)=>{
    console.log(message);
    io.to(message.room).emit('chatMessages',message)
    if(!lastMessages[message.room])
      lastMessages[message.room] = [message]
    else
      lastMessages[message.room].push(message)
  })
}

server.listen(port,()=>console.log(`Server on port ${port}`));
