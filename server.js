const express = require('express');
const admin = require('./config');
const app = express();
const port = 8000;

require('./routes')(app, admin)

app.listen(port, () => {
  console.log('We are live on ' + port);
});

module.exports = {app, admin};