const express = require("express");
const path = require("path");
const http = require("http");
const cors = require("cors")
const cookieParser = require('cookie-parser');
const corsOptions = require('./config/corsOptions');;
const credentials = require('./middlewares/credentials');


const {routesInit} = require("./routes/configRoutes");

require("./db/mongoConnect")

const app = express();

app.use(credentials);

app.use(cors(corsOptions));

app.use(express.json());

app.use(cookieParser())

app.use(express.static(path.join(__dirname,"public")));


routesInit(app);


const server = http.createServer(app);

module.exports = server;
