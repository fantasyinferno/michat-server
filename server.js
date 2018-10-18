const express = require('express');
const admin = require('./config');
const app = express();
const port =  process.env.PORT || 8000;
const bodyParser = require('body-parser');
app.use(bodyParser.json());

require('./routes')(app, admin)

app.listen(port, () => {
  console.log('We are live on ' + port);
});

module.exports = {app, admin};