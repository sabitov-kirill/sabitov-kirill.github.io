const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// messages storage
let messages = [];

app.use(express.static('./public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  for (message of messages) {
    socket.emit('message', JSON.stringify(message));
    console.log("Onload message send:" + JSON.stringify(message));
  }

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('message', (msg) => {
    let new_msg = JSON.parse(msg);
    messages.push(new_msg);

    io.emit('message', msg);
    console.log("Message pushed:" + msg);
  });
});

server.listen(8000, () => {
  console.log('listening on *:3000');
});