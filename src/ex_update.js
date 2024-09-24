const oracledb = require('oracledb');

async function runApp() {
  let connection;
  try {
    connection = await oracledb.getConnection({ 
      user: "tangram", 
      password: "3qL9EF68bqKT", 
      connectionString: "192.168.0.1:1521/Tasy" 
    });
    console.log("Successfully connected to Oracle Database");
  
    // Alterar o formato da data
    let h = await connection.execute(`ALTER SESSION SET NLS_DATE_FORMAT = 'DD/MM/YYYY'`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    console.log(h);

    // Executar a consulta de UPDATE
    let result = await connection.execute(
      `
        --UPDATE TASY.ativia_msaude_gera_auto_boleto aut
        --SET aut.LINKBOLETO = REPLACE(LINKBOLETO,'.pdf','-entrada.pdf')
        --WHERE aut.TPBOLETO = 'PJ'

        --DELETE FROM TASY.ativia_msaude_end_coordenadas

        DELETE FROM  TASY.ativia_msaude_gera_auto_boleto aut
        WHERE aut.NR_SEQ_PAGADOR = 22946
        AND aut.nr_titulo = 2319930


      `
    );

    console.log(`${result.rowsAffected} row(s) updated.`);

    // Fazer o commit das alterações
    await connection.commit();
    console.log("Changes committed.");

  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

runApp();
