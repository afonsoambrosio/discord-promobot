var admin = require('firebase-admin');

var serviceAccount = require('./firebase_key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FB_DB_URL
});

var db = admin.database();

module.exports = { db };