const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const mongoose = require('mongoose');
const { MONGO_DB_CONFIG } = require('./config/app.config');
const { initMeetingServer } = require('./meeting-server');

initMeetingServer(server);

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_DB_CONFIG.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log("Could not connect to the database. Exiting now...", err);
});

app.use(express.json());
app.use("/api", require('./routes/app-routes'));

server.listen(process.env.port || 4000, function () {
    console.log("Listening on port 4000");
});