const mongoose = require('mongoose');
require("dotenv").config()


main().catch(err => console.log(err));

async function main() {
  mongoose.set('strictQuery', true)
  await mongoose.connect(`mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.yn7n9ue.mongodb.net/thinkFun`);
  console.log("mongo connect thinkFun atlas");
  
  // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}