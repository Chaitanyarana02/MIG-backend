const express = require('express');
const bodyParser = require('body-parser');
const app= express();
const cors = require('cors')
const multer = require('multer');
require('dotenv').config();
const Customer = require('./routes/Customer.js');
const UserRoutes = require('./routes/User.js');
const AdminRoutes = require('./routes/Admin.js');


app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use('/api', Customer);
app.use('/api', UserRoutes);
app.use('/api', AdminRoutes);


module.exports = app;