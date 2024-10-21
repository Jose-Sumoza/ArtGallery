require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require("cors");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require("path");
const userRouter = require('../routes/userRouter');
const artistRouter = require('../routes/artistRouter');
const postRouter = require('../routes/postRouter');

const app = express();

// SETTINGS
const { PORT = 8080 } = process.env;

// MIDDLEWARES
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());
app.use(cookieParser());

// CONNECT TO MONGODB
const URI = process.env.MONGODB_URL;

const connectMongo = async () => {
	try {
		await mongoose.connect(URI);
		console.log("Connected to database.");
	} catch (err) {
		console.error(err);
	};
};

connectMongo();

mongoose.connection.on('error', err => {
	console.error(err.message);
});

//ROUTES
app.use('/user', userRouter);
app.use('/api', artistRouter);
app.use('/api', postRouter);

if (process.env.NODE_ENV === 'production') {
	app.use(express.static("../client/dist"));
	app.get("*", (req, res) => {
		res.sendFile(path.join(__dirname, '../client', 'dist', 'index.html'));
	});
};

//STARTING SERVER
app.listen(PORT, () => {
    console.log(`Server at port ${ PORT }`);
});