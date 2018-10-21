let admin = require("firebase-admin");

let serviceAccount = require("./service-account/michat-3ebcd-firebase-adminsdk-orivf-2afacfe1f9.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://michat-3ebcd.firebaseio.com",
  storageBucket: "michat-3ebcd.appspot.com",
});

module.exports = admin;