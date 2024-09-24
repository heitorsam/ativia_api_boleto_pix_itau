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
    console.log("Successfully connected to Oracle Database");
  
    // Now query the rows back
    let h = await connection.execute( `alter session set nls_date_format = 'dd/mm/yyyy'`, [], { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT });
    console.log(h);
    

        let result = await connection.execute( 

          `
            --SELECT * FROM TASY.ativia_msaude_rede_cred rc

            --SELECT * TASY.ativia_msaude_gera_auto_boleto aut
            
            --select NOME,NOME_PAGADOR,NOME_TITULAR,b.chave_beneficiario, b.matricula, 
            --b.nr_seq_pagador, b.cpf,b.CPF_PAGADOR, b.nm_mae, b.DATA_NASCIMENTO,b.NOME 
            --from TASY.ativia_msaude_beneficiarios b 
            --where b.cpf_pagador = '05743341818'

            --SELECT tit.DT_VENCIMENTO,   TRUNC(SYSDATE) - TRUNC(tit.DT_VENCIMENTO) AS DIAS_EM_ATRASO

            --FROM TASY.ativia_tangram_notif_lote_tit tit
            --WHERE tit.LOTE = 16646

            --SELECT * FROM TASY.ativia_msaude_rede_cred WHERE CPF_CNPJ = '02885600000100' 

            --02885600000100


            SELECT *
                FROM TASY.ativia_tangram_notif_lote_dia lt 
                --WHERE lt.LOTE BETWEEN 16646 AND 16648 
                --ORDER BY lt.LOTE DESC

            
          ` 

          , [], { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT });         
         
    
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