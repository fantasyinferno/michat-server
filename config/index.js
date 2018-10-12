let admin = require("firebase-admin");

let serviceAccount = require("./michat-3ebcd-firebase-adminsdk-orivf-f1578d58a8.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://michat-3ebcd.firebaseio.com"
});

module.exports = admin;