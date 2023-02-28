const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const router = require('./src/routes/route');
require('dotenv').config();
const app = express();

app.use(cors());

//parse application/x-www-form-urlencode
app.use(bodyParser.urlencoded({extended:false}));

//parse application/json
app.use(bodyParser.json());

//save log
app.use(morgan('dev'));

//Create a write stream (in append mode):
let accessLogStream = fs.createWriteStream(path.join(__dirname,'src/logs/access.log'),{flags:'a'});

app.use(morgan('combined',{stream:accessLogStream}));
app.use('/servicio_rest/express/recagua/api',router);

module.exports = app;