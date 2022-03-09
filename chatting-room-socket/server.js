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
    socket.emit('message', message);
  }

  socket.on('disconnect', () => {
    console.log(`A user "${socket.id}" disconnected.`);
  });

  socket.on('message', (msg) => {
    try {
      messages.push(msg);
      io.emit('message', msg);
    } catch {
      console.log("Error. Cannton parse message from user.");
    }
  });
});

const port = process.env.PORT || 5000
server.listen(port, () => {
  console.log(`Server is listening on "${port}".`);
});