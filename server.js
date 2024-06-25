const http = require('http');
const express = require('express');
const port = 3011;
const app = require('./app');
app.use('/uploads', express.static('uploads'));

const server = http.createServer(app);
server.listen(port, () => {
    console.log('Server is running on port 3011');
});
