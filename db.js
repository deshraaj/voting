const mongoose = require('mongoose');
require('dotenv').config();

// define the mongoDB connection URL
// const mongoURL = 'mongodb://localhost:27017/hotels'//we can replace hotels with our convinience and this URL will connecto the local server
const mongoURL = process.env.LOCAL_DB_URL;
// const mongoURL = process.env.DB_URL// this URL will connect to the cloud server



//setup mongoDB connection
mongoose.connect(mongoURL,{})

//get the default connection
// mongoose maintains a default connection object representing the MongoDB connection
const db = mongoose.connection;

// Define event listeners for database connection

db.on('connected',()=>{
    console.log('connected with MongoDB server');
})
db.on('error',()=>{
    console.log('MongoDB server error');
})
db.on('disconnected',()=>{
    console.log('disconnected with MongoDB server');
})

module.exports = db