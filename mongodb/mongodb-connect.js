'use strict'
let mongoose = require("mongoose");

let mongoDB = process.env.MONGODB_URL || 'mongodb://localhost:27017/AlumnoDB';
mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useCreateIndex: true
});
let db = mongoose.connection;



module.exports = {mongoose}