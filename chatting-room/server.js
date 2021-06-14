const http = require("http");
const fs = require('fs').promises;

// requests handle
let messages = [];

const requestListener = function (req, res) {
  console.log(
    `Request: ${req.method}, ${req.url}.`
  );

  // html page and css file loading
  if (req.url === "/") {
    fs.readFile(`${__dirname}/client.html`)
      .then((html_content) => {
        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end(html_content);
      });
  } else if (req.url.endsWith(".css")) {
    fs.readFile(`${__dirname}/client.css`)
      .then((css_content) => {
        res.setHeader("Content-Type", "text/css");
        res.writeHead(200);
        res.end(css_content);
      });
  } 
  
  // messages getting and posting
  else if (req.url === "/msg" && req.method === "POST") {
    let data = "";
    req.once('data', chunk => {
      data += chunk;
    })
    req.once('end', () => {
      messages.push(JSON.parse(data));
      res.end();
    })
  } else if (req.url === "/msg" && req.method === "GET") {
    res.setHeader("Content-Type", "application/json");
    res.writeHead(200);
    res.end(JSON.stringify(messages));
  } 
  
  // error
  else {
    res.writeHead(500);
    res.end("Error, unsupported");
    return;
  }
};

// creating server
const port = 8000;
const server = http.createServer(requestListener);
server.listen(port);