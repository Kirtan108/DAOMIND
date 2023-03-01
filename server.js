const express = require('express');
const app = express();
const dotenv = require('dotenv')
dotenv.config()

app.all('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.write('<link href="https://fonts.googleapis.com/css?family=Roboto Condensed" rel="stylesheet"> <style> body {font-family: "Roboto Condensed";font-size: 22px;} <p>Hosting Active</p>');
  res.end();
})

function keepAlive() {
  app.listen(process.env.PORT || 8080, () => { console.log("Bot is alive!") });
}

module.exports = { keepAlive }