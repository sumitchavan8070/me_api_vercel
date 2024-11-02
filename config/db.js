const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Connected to MongoDB at ${mongoose.connection.host}`.bgCyan.white);
  } catch (error) {
    console.log(`Database Connection Error: ${error.message}`.bgRed.white);
    process.exit(1);
  }
};

module.exports = connectDB;
