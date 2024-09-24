const dbConfig = require('../config/database');
const oracledb = require('oracledb');

var connection;
try{
    connection = await oracledb.getConnection({ user: "tangram", password: "3qL9EF68bqKT", connectionString: "TNSNAMES.ORA TASY=(DESCRIPTION=(ADDRESS_LIST=(ADDRESS = (PROTOCOL = TCP)(HOST = 192.168.0.1)(PORT = 1521)))(CONNECT_DATA=(SERVICE_NAME = TASY)(SERVER=DEDICATED)))" });
    console.log("conectado");
}catch (err) {
    console.error(err);
  }

module.exports = connection;
