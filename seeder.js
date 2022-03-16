const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');


//load env vars
dotenv.config({path: './config/config.env'});

//load models
const Bootcamp = require('./models/Bootcamp');

//connet to DB
mongoose.connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
});

//read JSON files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));

//import into DB
const importData = async ()=>{
    try{
        await Bootcamp.create(bootcamps);

        console.log('Data imported...'.green.inverse);
        process.exit();
    }catch(err){
        console.log(err);
    }
}

//delete data
const deleteData = async ()=>{
    try{
        await Bootcamp.deleteMany();

        console.log('Data destroyed...'.red.inverse);
        process.exit();
    }catch(err){
        console.log(err);
    }
}

if(process.argv[2] === '-i'){
    importData();
}else if(process.argv[2] === '-d'){
    deleteData();
}