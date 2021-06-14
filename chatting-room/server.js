const http = require("http");
const fs = require('fs').promises;

// requests handle
let messages = [];

const requestListener = function (req, res) {
  console.log(
    `Request: ${req.method}, ${req.url}.`
  );

  if (req.url === "/") {
    fs.readFile(`${__dirname}/client.html`)
      .then((html_content) => {
        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end(html_content);
      });
  } else if (req.url === "/msg" && req.method === "POST") {
    let data = "";
    req.once('data', chunk => {
      data += chunk;
    })
    req.once('end', () => {
      let new_msg = JSON.parse(data);
      messages.push(new_msg);
      console.log(`New msg added - { name: "${new_msg.name}", message: "${new_msg.message}" }.`);
      res.end();
    })
  } else if (req.url === "/msg" && req.method === "GET") {
    let messages_pane_text = "";

    for (message of messages) {
      messages_pane_text += `${message.name}: ${message.message}<br>`;
    }

    res.setHeader("Content-Type", "text");
    res.writeHead(200);
    res.end(messages_pane_text);
  } else {
    res.writeHead(500);
    res.end("Error, unsupported");
    return;
  }
};

// creating server
const port = 8000;
const server = http.createServer(requestListener);
server.listen(port);