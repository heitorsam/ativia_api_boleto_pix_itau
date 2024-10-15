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
  
      // Return the result as JSON
      return res.status(200).json(boletos);
  
    } catch (error) {
      console.error('Erro ao gerar o boleto:', error);
      return res.status(500).json({ message: 'Erro ao gerar o boleto', error });
    }
  }

};

/*

  // Dados do boleto para enviar no POST
  const boletoData = {
    "etapa_processo_boleto": "efetivacao",
    "beneficiario": {
      "id_beneficiario": "150000052061"
    },
    "dado_boleto": {
      "tipo_boleto": "a vista",
      "descricao_instrumento_cobranca": "boleto_pix",
      "texto_seu_numero": "000001",
      "codigo_carteira": "110",
      "valor_total_titulo": "90000000000030000",
      "codigo_especie": "01",
      "data_emissao": "2022-03-25",
      "valor_abatimento": "00000000000000010",
      "negativacao": {
        "negativacao": "8",
        "quantidade_dias_negativacao": "010"
      },
      "pagador": {
        "pessoa": {
          "nome_pessoa": "Joao Silva",
          "nome_fantasia": "Joao Silva",
          "tipo_pessoa": {
            "codigo_tipo_pessoa": "F",
            "numero_cadastro_pessoa_fisica": "26556923221"
          }
        },
        "endereco": {
          "nome_logradouro": "Av do Estado, 5533",
          "nome_bairro": "Mooca",
          "nome_cidade": "Sao Paulo",
          "sigla_UF": "SP",
          "numero_CEP": "04135010"
        }
      },
      "sacador_avalista": {
        "pessoa": {
          "nome_pessoa": "Sacador Teste",
          "tipo_pessoa": {
            "codigo_tipo_pessoa": "F",
            "numero_cadastro_pessoa_fisica": "38365972841"
          }
        },
        "endereco": {
          "nome_logradouro": "Av do Estado, 5533",
          "nome_bairro": "Mooca",
          "nome_cidade": "Sao Paulo",
          "sigla_UF": "SP",
          "numero_CEP": "04135010"
        }
      },
      "dados_individuais_boleto": [
        {
          "numero_nosso_numero": "12345678",
          "data_vencimento": "2022-07-30",
          "texto_uso_beneficiario": "000001",
          "valor_titulo": "00000000000010001",
          "data_limite_pagamento": "2022-10-30"
        }
      ],
      "juros": {
        "data_juros": "2022-09-30",
        "codigo_tipo_juros": "93",
        "valor_juros": "00000000000000010"
      },
      "multa": {
        "codigo_tipo_multa": "02",
        "percentual_multa": "000000100001",
        "data_multa": "2022-10-30"
      },
      "lista_mensagem_cobranca": [
        {
          "mensagem": "mensagem 1"
        }
      ],
      "desconto": {
        "codigo_tipo_desconto": "02",
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
      "chave": "pjoperador@gmail.com",
      "id_location": 789
    }
  };

*/


/*

  // Chamada para a API de geração de boletos com PIX
  const response = await axios.post(boletoUrl, boletoData, {
    httpsAgent: agent,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-itau-correlationID': correlationID // Passa o correlationID gerado
      //'x-sandbox-token': `Bearer ${token}`
    },
  });

  console.log('Boleto gerado com sucesso:', response.data);
  return res.status(200).json(response.data);

*/