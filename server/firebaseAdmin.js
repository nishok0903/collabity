const admin = require("firebase-admin");

const serviceAccount = require("./collabity-cf66c-firebase-adminsdk-fbsvc-d4b3e9e3d0.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
