// Bring in the mongoose module
const mongoose = require('mongoose');

const dbUrl = process.env.dbUrl || 'mongodb://localhost:27017/';
const dbName = process.env.dbName || 'yourotp';
const dbURI = dbUrl + dbName;

// Use native promises
mongoose.Promise = global.Promise;

// console to check what is the dbURI refers to
console.log('Database URL is =>>', dbURI);

// Open the mongoose connection to the database
async function dbConnect() {
  await mongoose.connect(dbURI);
}

dbConnect()
  .then(() => console.log(`mongoose connected to ${dbURI}`))
  .catch((err) => console.error(err));
