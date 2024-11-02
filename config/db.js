const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://sdchavan8070:Shubham%40123@schavan.za0uwda.mongodb.net/meadhikari");
    console.log(`Connected to Server ${mongoose.connection.host}`.bgCyan.white);
  } catch (error) {
    console.log(`Database Connection Error ${error}`.bgRed.white);
  }
};

module.exports = connectDB;
