const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static('dist'))

let messages = [];

io.on('connection', (socket) => {
  console.log(`A user "${socket.id}" connected.`);

  for (message of messages) {
    socket.emit('message', JSON.stringify(message));
  }

  socket.on('disconnect', () => {
    console.log(`A user "${socket.id}" disconnected.`);
  });

  socket.on('message', (msg) => {
    let new_msg = JSON.parse(msg);
    messages.push(new_msg);

    io.emit('message', msg);
  });
});

const port = process.env.PORT || 5000
server.listen(port, () => {
  console.log(`Server is listening on "${port}".`);
});