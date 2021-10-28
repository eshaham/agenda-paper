const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const routes = require('./routes');

require('dotenv').config();

const app = express();

app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../build')));

app.use('/api', routes);

app.listen(process.env.PORT || 3000, () => console.log('started running in port 3000'));
