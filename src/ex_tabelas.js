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
      `SELECT * FROM TASY.ativia_tangram_neg_bol_dados`, 
      [], { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    const rs = result.resultSet;

    let row;

    while ((row = await rs.getRow())) {

      let etapa_processo_boleto = row.ETAPA_PROCESSO_BOLETO ? row.ETAPA_PROCESSO_BOLETO : '';
      let id_beneficiario = row.ID_BENEFICIARIO ? row.ID_BENEFICIARIO : '';
      let descricao_instrumento_cobranca = row.DESCRICAO_INSTRUMENTO_COBRANCA ? row.DESCRICAO_INSTRUMENTO_COBRANCA : '';
      let tipo_boleto = row.TIPO_BOLETO ? row.TIPO_BOLETO : '';
      let codigo_carteira = row.CODIGO_CARTEIRA ? row.CODIGO_CARTEIRA : '';
      let forma_envio = row.FORMA_ENVIO ? row.FORMA_ENVIO : '';
      let assunto_email = row.ASSUNTO_EMAIL ? row.ASSUNTO_EMAIL : '';
      let mensagem_email = row.MENSAGEM_EMAIL ? row.MENSAGEM_EMAIL : '';
      let codigo_especie = row.CODIGO_ESPECIE ? row.CODIGO_ESPECIE : '';
      let valor_abatimento = row.VALOR_ABATIMENTO ? row.VALOR_ABATIMENTO : '';
      let data_emissao = row.DATA_EMISSAO ? row.DATA_EMISSAO : '';
      
      let texto_endereco_email = row.TEXTO_ENDERECO_EMAIL ? row.TEXTO_ENDERECO_EMAIL : '';
      let nome_pessoa = row.NOME_PESSOA ? row.NOME_PESSOA : '';
      let nome_fantasia = row.NOME_FANTASIA ? row.NOME_FANTASIA : '';
      let codigo_tipo_pessoa = row.CODIGO_TIPO_PESSOA ? row.CODIGO_TIPO_PESSOA : '';
      let numero_cadastro_pessoa_fisica = row.NUM_CADASTRO_PF ? row.NUM_CADASTRO_PF : '';
      let numero_cadastro_nacional_pessoa_juridica = row.NUM_CADASTRO_PJ ? row.NUM_CADASTRO_PJ : '';
      
      let nome_logradouro = row.NOME_LOGRADOURO ? row.NOME_LOGRADOURO : '';
      let nome_bairro = row.NOME_BAIRRO ? row.NOME_BAIRRO : '';
      let nome_cidade = row.NOME_CIDADE ? row.NOME_CIDADE : '';
      let sigla_UF = row.SIGLA_UF ? row.SIGLA_UF : '';
      let numero_CEP = row.NUMERO_CEP ? row.NUMERO_CEP : '';
      
      let nome_pessoa_avalista = row.NOME_PESSOA_AVAL ? row.NOME_PESSOA_AVAL : '';
      let codigo_tipo_pessoa_avalista = row.CODIGO_TIPO_PESSOA_AVAL ? row.CODIGO_TIPO_PESSOA_AVAL : '';
      let numero_cadastro_pessoa_fisica_avalista = row.NUM_CADASTRO_PF_AVAL ? row.NUM_CADASTRO_PF_AVAL : '';
      let numero_cadastro_nacional_pessoa_juridica_avalista = row.NUM_CADASTRO_PJ_AVAL ? row.NUM_CADASTRO_PJ_AVAL : '';
      
      let nome_logradouro_avalista = row.NOME_LOGRADOURO_AVAL ? row.NOME_LOGRADOURO_AVAL : '';
      let nome_bairro_avalista = row.NOME_BAIRRO_AVAL ? row.NOME_BAIRRO_AVAL : '';
      let nome_cidade_avalista = row.NOME_CIDADE_AVAL ? row.NOME_CIDADE_AVAL : '';
      let sigla_UF_avalista = row.SIGLA_UF_AVAL ? row.SIGLA_UF_AVAL : '';
      let numero_CEP_avalista = row.NUMERO_CEP_AVAL ? row.NUMERO_CEP_AVAL : '';
      
      let numero_nosso_numero = row.NUMERO_NOSSO_NUMERO ? row.NUMERO_NOSSO_NUMERO : '';
      let data_vencimento = row.DATA_VENCIMENTO ? row.DATA_VENCIMENTO : '';
      let valor_titulo = row.VALOR_TITULO ? row.VALOR_TITULO : '';
      let data_limite_pagamento = row.DATA_LIMITE_PAGAMENTO ? row.DATA_LIMITE_PAGAMENTO : '';
      let texto_seu_numero = row.TEXTO_SEU_NUMERO ? row.TEXTO_SEU_NUMERO : '';
      let texto_uso_beneficiario = row.TEXTO_USO_BENEFICIARIO ? row.TEXTO_USO_BENEFICIARIO : '';
      
      let codigo_tipo_juros = row.CODIGO_TIPO_JUROS ? row.CODIGO_TIPO_JUROS : '';
      let valor_juros = row.VALOR_JUROS ? row.VALOR_JUROS : '';
      let percentual_juros = row.PERCENTUAL_JUROS ? row.PERCENTUAL_JUROS : '';
      let data_juros = row.DATA_JUROS ? row.DATA_JUROS : '';
      
      let codigo_tipo_multa = row.CODIGO_TIPO_MULTA ? row.CODIGO_TIPO_MULTA : '';
      let valor_multa = row.VALOR_MULTA ? row.VALOR_MULTA : '';
      let percentual_multa = row.PERCENTUAL_MULTA ? row.PERCENTUAL_MULTA : '';
      let data_multa = row.DATA_MULTA ? row.DATA_MULTA : '';
      
      let codigo_tipo_desconto = row.CODIGO_TIPO_DESCONTO ? row.CODIGO_TIPO_DESCONTO : '';
      let descontos = row.DESCONTOS ? row.DESCONTOS : '';
      
      let codigo_tipo_autorizacao = row.CODIGO_TIPO_AUTORIZACAO ? row.CODIGO_TIPO_AUTORIZACAO : '';
      let codigo_tipo_recebimento = row.CODIGO_TIPO_RECEBIMENTO ? row.CODIGO_TIPO_RECEBIMENTO : '';
      let percentual_minimo = row.PERCENTUAL_MINIMO ? row.PERCENTUAL_MINIMO : '';
      let valor_maximo = row.VALOR_MAXIMO ? row.VALOR_MAXIMO : '';
      let percentual_maximo = row.PERCENTUAL_MAXIMO ? row.PERCENTUAL_MAXIMO : '';
      
      let protesto = row.PROTESTO ? row.PROTESTO : '';
      let quantidade_dias_protesto = row.QUANTIDADE_DIAS_PROTESTO ? row.QUANTIDADE_DIAS_PROTESTO : '';
      
      let negativacao = row.NEGATIVACAO ? row.NEGATIVACAO : '';
      let quantidade_dias_negativacao = row.QUANTIDADE_DIAS_NEGATIVACAO ? row.QUANTIDADE_DIAS_NEGATIVACAO : '';
      
      let codigo_instrucao_cobranca = row.CODIGO_INSTRUCAO_COBRANCA ? row.CODIGO_INSTRUCAO_COBRANCA : '';
      let quantidade_dias_apos_vencimento = row.QUANT_DIAS_APOS_VENC ? row.QUANT_DIAS_APOS_VENC : '';
      let dia_util = row.DIA_UTIL ? row.DIA_UTIL : '';
      
      let chave = row.CHAVE ? row.CHAVE : '';
      let id_location = row.ID_LOCATION ? row.ID_LOCATION : '';
      let tipo_cobranca = row.TIPO_COBRANCA ? row.TIPO_COBRANCA : '';

      let jsonBoleto = {
        "etapa_processo_boleto": etapa_processo_boleto,
        "beneficiario": {
          "id_beneficiario": id_beneficiario
        },
        "dado_boleto": {
          "tipo_boleto": tipo_boleto,
          "descricao_instrumento_cobranca": descricao_instrumento_cobranca,
          "texto_seu_numero": texto_seu_numero,
          "codigo_carteira": codigo_carteira,
          "valor_total_titulo": valor_titulo,
          "codigo_especie": codigo_especie,
          "data_emissao": data_emissao,
          "valor_abatimento": valor_abatimento,
          "negativacao": {
            "negativacao": negativacao,
            "quantidade_dias_negativacao": quantidade_dias_negativacao
          },
          "pagador": {
            "pessoa": {
              "nome_pessoa": nome_pessoa,
              "nome_fantasia": nome_fantasia,
              "tipo_pessoa": {
                "codigo_tipo_pessoa": codigo_tipo_pessoa,
                "numero_cadastro_pessoa_fisica": numero_cadastro_pessoa_fisica
              }
            },
            "endereco": {
              "nome_logradouro": nome_logradouro,
              "nome_bairro": nome_bairro,
              "nome_cidade": nome_cidade,
              "sigla_UF": sigla_UF,
              "numero_CEP": numero_CEP
            }
          },
          "sacador_avalista": {
            "pessoa": {
              "nome_pessoa": nome_pessoa_avalista,
              "tipo_pessoa": {
                "codigo_tipo_pessoa": codigo_tipo_pessoa_avalista,
                "numero_cadastro_pessoa_fisica": numero_cadastro_pessoa_fisica_avalista
              }
            },
            "endereco": {
              "nome_logradouro": nome_logradouro_avalista,
              "nome_bairro": nome_bairro_avalista,
              "nome_cidade": nome_cidade_avalista,
              "sigla_UF": sigla_UF_avalista,
              "numero_CEP": numero_CEP_avalista
            }
          },
          "dados_individuais_boleto": [
            {
              "numero_nosso_numero": numero_nosso_numero,
              "data_vencimento": data_vencimento,
              "texto_uso_beneficiario": texto_uso_beneficiario,
              "valor_titulo": valor_titulo,
              "data_limite_pagamento": data_limite_pagamento
            }
          ],
          "juros": {
            "data_juros": data_juros,
            "codigo_tipo_juros": codigo_tipo_juros,
            "valor_juros": valor_juros
          },
          "multa": {
            "codigo_tipo_multa": codigo_tipo_multa,
            "percentual_multa": percentual_multa,
            "data_multa": data_multa
          },
          "lista_mensagem_cobranca": [
            {
              "mensagem": "mensagem 1"
            }
          ],
          "desconto": {
            "codigo_tipo_desconto": codigo_tipo_desconto,
            "descontos": [
              {
                "data_desconto": "2022-06-30",
                "valor_desconto": "00000000000010000",
                "percentual_desconto": "000000001010"
              }
            ]
          }
        },
        "dados_qrcode": {
          "chave": chave,
          "id_location": id_location
        }
      };
      
      console.log(JSON.stringify(jsonBoleto, null, 2));   

    }//FIM WHILE
    
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