const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fileupload = require('express-fileupload');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

//load env vars
dotenv.config({path: './config/config.env'});

//connect to database
connectDB();

//Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');

const app = express();

//Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//File uploading middleware
app.use(fileupload());

// Sanitize data (to prevent SQL injections)
app.use(mongoSanitize());

// Set security header
app.use(helmet());

//Prevents XSS attacks
app.use(xss());

// Rate limiting (the number of requests in x duration)
const limiter = rateLimit({
    windowMs: 10*60*1000, //10 mins
    max: 100
});

app.use(limiter);

// prevent https param pollution
app.use(hpp());

//Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

//Mount routers
app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);

app.use(errorHandler);


const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, ()=>{
    console.log(`Server is listening on ${PORT} in ${process.env.NODE_ENV} mode`.yellow.bold);  
})

//handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) =>{
    console.log(`Error: ${err.message}`.red);
    //close server and exit process
    server.close(()=> process.exit(1))
})
