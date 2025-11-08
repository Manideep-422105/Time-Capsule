const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology:true,
    })
    .then(() => console.log("DataBase Connected Successfully"))
    .catch( (error) => {
        console.log("DataBase Connection Failed");
        console.error(error);
        procAess.exit(1);
    } )
};