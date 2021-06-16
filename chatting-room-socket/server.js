const express = require('express');
const app = express();

app.use(express.static('public'))

// messages storage
let messages = [];

// requests handle
app.get("/msg", (req, res) => {
  res.status(200).send(JSON.stringify(messages));
});
app.post("/msg", (req, res) => {
  let data = "";
  req.on('data', (chunk) => {
    data += chunk;
  })
  req.on('end', () => {
    messages.push(JSON.parse(data));
    res.status(200);
  })
})

// creating server
const port = 8000;
app.listen(port, () => console.log(`Server is listering on port ${port}`));