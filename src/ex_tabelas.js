const oracledb = require('oracledb');
async function runApp()
{
  let connection;
  try {
    connection = await oracledb.getConnection({ 
      user: "tangram", 
      password: "3qL9EF68bqKT", 
      connectionString: "192.168.0.1:1521/Tasy" 
    });
  
    let h = await connection.execute( `alter session set nls_date_format = 'dd/mm/yyyy'`, [], { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT });
    
    let result = await connection.execute( 
      `select * from TASY.ativia_tangram_neg_bol_dados b
where 1=1
and B.texto_seu_numero = 2338900`, 
      [], { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    const rs = result.resultSet; let row;
    while ((row = await rs.getRow())) {
        console.log(row);
    }
    
    await rs.close();
    

  } catch (err) {

    console.error(err);
    
  } finally {

    if (connection){

      try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }

    }
  }
}
runApp();