const oracledb = require('oracledb');
const connectionProperties = require('../config/database.js')
const fs = require('fs');
const axios = require('axios');
const https = require('https');
const { v4: uuidv4 } = require('uuid'); // Importa a função para gerar UUID

// Configurações do cliente
const clientId = '75526f47-2bba-4187-a564-c06eeb534a25';
const clientSecret = 'e98ad26c-08f2-4a6e-8cc4-31f5b06c58f3';
// URL do token
const tokenUrl = 'https://sts.itau.com.br/api/oauth/token'; // URL correta
//URL do boleto pix SANDBOX
//const boletoUrl = 'https://sandbox.devportal.itau.com.br/itau-ep9-gtw-pix-recebimentos-conciliacoes-v2-ext/v2/boletos_pix';
const boletoUrl =  'https://secure.api.itau/pix_recebimentos_conciliacoes/v2';

// Caminho para o seu arquivo PFX
const pfxPath = 'certificados/CERTIFICADO_FINAL.pfx';

// Leia o arquivo PFX e a senha (se necessário)
const pfx = fs.readFileSync(pfxPath);
const password = 'e98ad26c-08f2-4a6e-8cc4-31f5b06c58f3'; // Substitua pela sua senha

// Crie um agente HTTPS com o PFX
const agent = new https.Agent({
  pfx: pfx,
  passphrase: password,
});

// Defina os dados do corpo da requisição
const data = new URLSearchParams();
data.append('grant_type', 'client_credentials'); // ou outro tipo de grant, conforme necessário
data.append('client_id', clientId); // Substitua pelo seu Client ID
data.append('client_secret', clientSecret); // Substitua pelo seu Client Secret

// Função para obter o token OAuth
async function GeraOAuthFunc() {
  try {
    const response = await axios.post(tokenUrl, data, {
      httpsAgent: agent,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
    });

    // Retorna o token
    return response.data.access_token;
  } catch (error) {
    console.error('Erro ao obter o token:', error);
    throw new Error('Erro ao obter o token');
  }
}

module.exports = {

  async GeraOAuth(req, res) {
    try {
      const token = await GeraOAuthFunc();
      console.log('Token:', token);
      return res.status(200).json({ access_token: token });
    } catch (error) {
      console.error('Erro ao obter o token:', error);
      return res.status(500).json({ message: 'Erro ao obter o token', error });
    }
  },

  async GeraBoletoPix(req, res) {
    try {
      // Token OAuth2
      const token = await GeraOAuthFunc();
      console.log('Token Gerado:', token);
  
      const correlationID = uuidv4();
      console.log('correlationID Gerado:', correlationID);
  
      // CONSULTANDO BOLETO
      const connection = await oracledb.getConnection(connectionProperties);
      await connection.execute(`alter session set nls_date_format = 'dd/mm/yyyy'`);
  
      console.log('Coletando dados AppListaPlano...');
  
      const consulta = `
        SELECT * FROM TASY.ativia_tangram_neg_bol_dados bol
        WHERE bol.NR_SEQ_NEGOCIACAO = 10541
      `;
  
      console.log(consulta);
  
      const result = await connection.execute(consulta, [], { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT });
      const rs = result.resultSet;
      
      let row;
      let boletos = [];
  
      while ((row = await rs.getRow())) {
        let jsonBoleto = {
          "etapa_processo_boleto": row.ETAPA_PROCESSO_BOLETO || '',
          "beneficiario": {
            "id_beneficiario": row.ID_BENEFICIARIO || ''
          },
          "dado_boleto": {
            "tipo_boleto": row.TIPO_BOLETO || '',
            "descricao_instrumento_cobranca": row.DESCRICAO_INSTRUMENTO_COBRANCA || '',
            "texto_seu_numero": row.TEXTO_SEU_NUMERO || '',
            "codigo_carteira": row.CODIGO_CARTEIRA || '',
            "valor_total_titulo": row.VALOR_TITULO || '',
            "codigo_especie": row.CODIGO_ESPECIE || '',
            "data_emissao": row.DATA_EMISSAO || '',
            "valor_abatimento": row.VALOR_ABATIMENTO || '',
            "negativacao": {
              "negativacao": row.NEGATIVACAO || '',
              "quantidade_dias_negativacao": row.QUANTIDADE_DIAS_NEGATIVACAO || ''
            },
            "pagador": {
              "pessoa": {
                "nome_pessoa": row.NOME_PESSOA || '',
                "nome_fantasia": row.NOME_FANTASIA || '',
                "tipo_pessoa": {
                  "codigo_tipo_pessoa": row.CODIGO_TIPO_PESSOA || '',
                  "numero_cadastro_pessoa_fisica": row.NUM_CADASTRO_PF || ''
                }
              },
              "endereco": {
                "nome_logradouro": row.NOME_LOGRADOURO || '',
                "nome_bairro": row.NOME_BAIRRO || '',
                "nome_cidade": row.NOME_CIDADE || '',
                "sigla_UF": row.SIGLA_UF || '',
                "numero_CEP": row.NUMERO_CEP || ''
              }
            },
            "sacador_avalista": {
              "pessoa": {
                "nome_pessoa": row.NOME_PESSOA_AVAL || '',
                "tipo_pessoa": {
                  "codigo_tipo_pessoa": row.CODIGO_TIPO_PESSOA_AVAL || '',
                  "numero_cadastro_pessoa_fisica": row.NUM_CADASTRO_PF_AVAL || ''
                }
              },
              "endereco": {
                "nome_logradouro": row.NOME_LOGRADOURO_AVAL || '',
                "nome_bairro": row.NOME_BAIRRO_AVAL || '',
                "nome_cidade": row.NOME_CIDADE_AVAL || '',
                "sigla_UF": row.SIGLA_UF_AVAL || '',
                "numero_CEP": row.NUMERO_CEP_AVAL || ''
              }
            },
            "dados_individuais_boleto": [
              {
                "numero_nosso_numero": row.NUMERO_NOSSO_NUMERO || '',
                "data_vencimento": row.DATA_VENCIMENTO || '',
                "texto_uso_beneficiario": row.TEXTO_USO_BENEFICIARIO || '',
                "valor_titulo": row.VALOR_TITULO || '',
                "data_limite_pagamento": row.DATA_LIMITE_PAGAMENTO || ''
              }
            ],
            "juros": {
              "data_juros": row.DATA_JUROS || '',
              "codigo_tipo_juros": row.CODIGO_TIPO_JUROS || '',
              "valor_juros": row.VALOR_JUROS || ''
            },
            "multa": {
              "codigo_tipo_multa": row.CODIGO_TIPO_MULTA || '',
              "percentual_multa": row.PERCENTUAL_MULTA || '',
              "data_multa": row.DATA_MULTA || ''
            },
            "desconto": {
              "codigo_tipo_desconto": row.CODIGO_TIPO_DESCONTO || '',
              "descontos": [
                {
                  "data_desconto": row.DATA_DESCONTO || '',
                  "valor_desconto": row.VALOR_DESCONTO || '',
                  "percentual_desconto": row.PERCENTUAL_DESCONTO || ''
                }
              ]
            }
          },
          "dados_qrcode": {
            "chave": row.CHAVE || '',
            "id_location": row.ID_LOCATION || ''
          }
        };
        
        // Add boleto to array
        boletos.push(jsonBoleto);
        console.log(JSON.stringify(jsonBoleto, null, 2));
      }
  
      // Close the result set and connection
      await rs.close();
      await connection.close();

      //SALVANDO DADOS NO PHP
      
      try {

        // Estrutura que será enviada para o PHP
        const postData = {
          boletos: boletos // Adiciona o array boletos ao objeto
        };

        console.log(JSON.stringify(postData, null, 2));

        const response = await axios.post(
            'http://enviabolatv.tangram.app.br/rotina_gera_carteirinha/api/proc_envio_boleto_pix_itau.php',
            postData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log(response.data);
            
        const lista = response.data;

        console.log('lista.id_retorno: ', lista.id_retorno);
        
        const resposta = {
            codAcao: lista.id_retorno,
            msgInterna: lista.message,
            msgExterna:lista.message_externa,
            msgExternaExibir: "0",
            statusVersao: 1,
            statusVersaoMsg: ""
        };
            
        res.status(200).json(resposta);
     
    } catch (err) {

        console.error(err.toString());

        console.error('Erro ao processar a solicitação:', err.toString());

        const mensagem_erro = {
            codAcao: 2,
            msgInterna: "OK",
            msgExterna: "Erro interno ao processar a solicitação.",
            msgExternaExibir: "1",
            statusVersao: 1,
            statusVersaoMsg: "Erro interno ao processar a solicitação."
        };

        return res.status(200).json(mensagem_erro);
    }
  
    } catch (error) {
      console.error('Erro ao gerar o boleto:', error);
      return res.status(500).json({ message: 'Erro ao gerar o boleto', error });
    }
  }

};
