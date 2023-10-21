// Bring in the mongoose module
const mongoose = require('mongoose');

const dbUrl = process.env.dbUrl || 'mongodb://localhost:27017/';
const dbName = process.env.dbName || 'yourotp';
const dbURI = dbUrl + dbName;

// Use native promises
mongoose.Promise = global.Promise;

// console to check what is the dbURI refers to
console.log("Database URL is =>>", dbURI);

mongoose.set('bufferCommands', false);

// Open the mongoose connection to the database
mongoose.connect(dbURI, {
	'autoIndex': false,
});

// Db Connection
var db = mongoose.connection;

db.on('connected', function () {
	console.log('Mongoose connected to ' + dbURI);
});

db.on('error', function (err) {
	console.log('Mongoose connection error: ' + err);
});

db.on('disconnected', function () {
	console.log('Mongoose disconnected');
});

process.on('SIGINT', function () {
	db.close(function () {
		console.log('Mongoose disconnected through app termination');
		process.exit(0);
	});
});
