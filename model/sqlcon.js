const mysql = require("mysql");
const mysqlConnection = mysql.createConnection({
    host:"localhost",
    user:"admin",
    password:"S$192118110s",
    database:"Employee",
    multipleStatements:true
});

mysqlConnection.connect((err)=>{
    if(!err){
        console.log("Succefully connected mysql server -> localhost:3306");
    }else{
        console.log("Please check if mysql server is running at localhost:3306");
    }
});

module.exports = mysqlConnection
