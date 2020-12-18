// Load Packages
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
// const cred = require("../credentials");
const port = process.env.PORT || 5000;

// Firebase DB
admin.initializeApp({
    credential: admin.credential.cert({
        "type": process.env.type,
        "project_id": process.env.project_id,
        "private_key_id": process.env.private_key_id,
        "private_key": process.env.private_key,
        "client_email": process.env.client_email,
        "client_id": process.env.client_id,
        "auth_uri": process.env.auth_uri,
        "token_uri": process.env.token_uri,
        "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
        "client_x509_cert_url": process.env.client_x509_cert_url
    }),
    databaseURL: "https://cdpu-helper.firebaseio.com"
});
export const db = admin.firestore();
// console log successful db connection

// Express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Router
require("./routes/reminder_route")(app);

// Service
const reminder_service = require("./services/reminder_service");
reminder_service.check_db_update();

// Run
app.listen(port, function() {
  console.log("[App] Server is running on port " + port);
});
