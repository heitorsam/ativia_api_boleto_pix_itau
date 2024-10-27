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
      
        //console.log(JSON.stringify(jsonBoleto, null, 2));

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

        //console.log(JSON.stringify(postData, null, 2));

        const response = await axios.post(
            'http://enviabolatv.tangram.app.br/rotina_gera_carteirinha/api/proc_envio_boleto_pix_itau.php',
            postData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        //console.log(response.data);
            
        const lista = response.data;

        console.log('lista.id_retorno: ', lista.id_retorno);

        if(lista.id_retorno == 0){

          const responseSelect = await axios.post(
            'http://enviabolatv.tangram.app.br/rotina_gera_carteirinha/api/select_lista_boleto_pix_itau.php'
          );

          //console.log(responseSelect.data);
              
          const listaSelect = responseSelect.data;

          console.log('listaSelect.id_retorno: ', listaSelect.id_retorno);

          if(listaSelect.id_retorno == 0){

            listaSelect.dados.forEach(async (item, index) => {

              console.log(`ID do boleto [${index}]:`, item.id);

              let boletosApiItau = {
                "etapa_processo_boleto": item.etapa_processo_boleto || '',
                "beneficiario": {
                  "id_beneficiario": item.beneficiario_id_beneficiario || ''
                },
                "dado_boleto": {
                  "tipo_boleto": item.dado_boleto_tipo_boleto || '',
                  "descricao_instrumento_cobranca": item.dado_boleto_descricao_instrumento_cobranca || '',
                  "texto_seu_numero": item.dado_boleto_texto_seu_numero || '',
                  "codigo_carteira": item.dado_boleto_codigo_carteira || '',
                  "valor_total_titulo": item.dado_boleto_valor_total_titulo || '',
                  "codigo_especie": item.dado_boleto_codigo_especie || '',
                  "data_emissao": item.dado_boleto_data_emissao || '',
                  "valor_abatimento": item.dado_boleto_valor_abatimento || '',
                  "negativacao": {
                    "negativacao": item.negativacao_negativacao || '',
                    "quantidade_dias_negativacao": item.negativacao_quantidade_dias_negativacao || ''
                  },
                  "pagador": {
                    "pessoa": {
                      "nome_pessoa": item.pagador_pessoa_nome_pessoa || '',
                      "nome_fantasia": item.pagador_pessoa_nome_fantasia || '',
                      "tipo_pessoa": {
                        "codigo_tipo_pessoa": item.pagador_pessoa_tipo_pessoa_codigo_tipo_pessoa || '',
                        "numero_cadastro_pessoa_fisica": item.pagador_pessoa_tipo_pessoa_numero_cadastro_pessoa_fisica || ''
                      }
                    },
                    "endereco": {
                      "nome_logradouro": item.pagador_endereco_nome_logradouro || '',
                      "nome_bairro": item.pagador_endereco_nome_bairro || '',
                      "nome_cidade": item.pagador_endereco_nome_cidade || '',
                      "sigla_UF": item.pagador_endereco_sigla_UF || '',
                      "numero_CEP": item.pagador_endereco_numero_CEP || ''
                    }
                  },
                  "sacador_avalista": {
                    "pessoa": {
                      "nome_pessoa": item.sacador_avalista_pessoa_nome_pessoa || '',
                      "tipo_pessoa": {
                        "codigo_tipo_pessoa": item.sacador_avalista_pessoa_tipo_pessoa_codigo_tipo_pessoa || '',
                        "numero_cadastro_pessoa_fisica": item.sacador_avalista_pessoa_tipo_pessoa_numero_cadastro_pessoa_fisica || ''
                      }
                    },
                    "endereco": {
                      "nome_logradouro": item.sacador_avalista_endereco_nome_logradouro || '',
                      "nome_bairro": item.sacador_avalista_endereco_nome_bairro || '',
                      "nome_cidade": item.sacador_avalista_endereco_nome_cidade || '',
                      "sigla_UF": item.sacador_avalista_endereco_sigla_UF || '',
                      "numero_CEP": item.sacador_avalista_endereco_numero_CEP || ''
                    }
                  },
                  "dados_individuais_boleto": [
                    {
                      "numero_nosso_numero": item.dados_individuais_boleto_numero_nosso_numero || '',
                      "data_vencimento": item.dados_individuais_boleto_data_vencimento || '',
                      "texto_uso_beneficiario": item.dados_individuais_boleto_texto_uso_beneficiario || '',
                      "valor_titulo": item.dados_individuais_boleto_valor_titulo || '',
                      "data_limite_pagamento": item.dados_individuais_boleto_data_limite_pagamento || ''
                    }
                  ],
                  "juros": {
                    "data_juros": item.juros_data_juros || '',
                    "codigo_tipo_juros": item.juros_codigo_tipo_juros || '',
                    "valor_juros": item.juros_valor_juros || ''
                  },
                  "multa": {
                    "codigo_tipo_multa": item.multa_codigo_tipo_multa || '',
                    "percentual_multa": item.multa_percentual_multa || '',
                    "data_multa": item.multa_data_multa	 || ''
                  },
                  "desconto": {
                    "codigo_tipo_desconto": item.descontos_codigo_tipo_desconto || '',
                    "descontos": [
                      {
                        "data_desconto": item.descontos_data_desconto || '',
                        "valor_desconto": item.descontos_valor_desconto || '',
                        "percentual_desconto": item.descontos_percentual_desconto || ''
                      }
                    ]
                  }
                },
                "dados_qrcode": {
                  "chave": item.dados_qrcode_chave || '',
                  "id_location": item.dados_qrcode_id_location || ''
                }
              };              

              //console.log(JSON.stringify(boletosApiItau, null, 2));

              ///////////////////////////////////////////
              //AQUI SERA EXECUTADO A API DO BANCO ITAU//
              ///////////////////////////////////////////

              console.log('AQUI SERA EXECUTADO A API DO BANCO ITAU');
        
              const respostaData = {

                "data": {
                  "id_fk": item.id, 
                  "codigo_canal_operacao": "API",
                  "codigo_operador": "150015605",
                  "etapa_processo_boleto": "efetivacao",
                  "beneficiario": {
                    "id_beneficiario": "150000052061",
                    "nome_cobranca": "Teste Batch atualiza",
                    "tipo_pessoa": {
                      "codigo_tipo_pessoa": "J",
                      "numero_cadastro_nacional_pessoa_juridica": "60701190000104"
                    },
                    "endereco": {
                      "nome_logradouro": "R ODORICO MENDES, 22222, TESTE",
                      "nome_bairro": "MOOCA",
                      "nome_cidade": "SAO PAULO",
                      "sigla_UF": "SP",
                      "numero_CEP": "03106030",
                      "numero": "22222",
                      "complemento": "TESTE"
                    }
                  },
                  "dado_boleto": {
                    "descricao_instrumento_cobranca": "boleto_pix",
                    "tipo_boleto": "a vista",
                    "pagador": {
                      "pessoa": {
                        "nome_pessoa": "Joao Silva",
                        "tipo_pessoa": {
                          "codigo_tipo_pessoa": "F",
                          "numero_cadastro_pessoa_fisica": "26556923222"
                        }
                      },
                      "endereco": {
                        "nome_logradouro": "Av do Estado, 5533",
                        "nome_bairro": "Mooca",
                        "nome_cidade": "Sao Paulo",
                        "sigla_UF": "SP",
                        "numero_CEP": "04135010"
                      },
                      "pagador_eletronico_DDA": true,
                      "praca_protesto": true
                    },
                    "codigo_carteira": "109",
                    "codigo_tipo_vencimento": 3,
                    "valor_total_titulo": "90000000000030000",
                    "dados_individuais_boleto": [
                      {
                        "id_boleto_individual": "03c9e46c-d8d1-4088-814a-7fd18694b10b",
                        "numero_nosso_numero": "00127623",
                        "dac_titulo": "4",
                        "data_vencimento": "2022-07-30",
                        "valor_titulo": "00000000000030000",
                        "texto_seu_numero": "000001",
                        "codigo_barras": "34197906200000300001570012762341500052061000",
                        "numero_linha_digitavel": "34191570071276234150600520610007790620000030000",
                        "data_limite_pagamento": "2032-07-30",
                        "lista_mensagens_cobranca": []
                      }
                    ],
                    "codigo_especie": "01",
                    "data_emissao": "2021-12-27",
                    "pagamento_parcial": false,
                    "quantidade_maximo_parcial": "0",
                    "recebimento_divergente": {
                      "codigo_tipo_autorizacao": "3",
                      "codigo_tipo_recebimento": "P",
                      "percentual_minimo": "00000000000000000",
                      "percentual_maximo": "00000000000000000"
                    }
                  },
                  "dados_qrcode": {
                    "chave": "pjoperador@gmail.com",
                    "txid": "BL150000052061109000000000127623",
                    "id_location": 78900000,
                    "location": "api.itau/pix/qr/v2/04f90e1d-afe4-4aa9-9246-579551f487275204000053039865802BR5920CARVALHEIRA",
                    "emv": "00020101021226860014BR.GOV.BCB.PIX2564spi-h.itau.com.br/pix/qr/v2/04f90e1d-afe4-4aa9-9246-579551f487275204000053039865802BR5920CARVALHEIRA GERALDES6009SAO PAULO62070503***6304AF50",
                    "base64": "iVBORw0KGgoAAAANSUhEUgAAAPoAAAD6AQAAAACgl2eQAAACy0lEQVR4Xu2XS3LlIBAE4SJw/1v4KHARmMzG9vssHLOw2hthj54l0hHl7qpGU/bP66O8P3lbN3DWDZx1A2f9HzBKqXuu0lfrq/tZ+oyHecDke7S6Ope5WuncVh9mAt6OosDG5uZ21cOkAqNPRBYeRqFa/wMAgX2wU6obUbpcgG/80tzctm37Gc/TAP0539e7q9/3fxlwmRWqhVuiaxjnrCwAnyCpa1Z+3ESngLSAsgCMijrkrU/n6p5piPKAPZqqkNqH/7rt6+th2gRAkTu2SqNI1WrBvP4VVwPqWZEXumWJgLfpyQOWLql2B7HLXvlbx7hZAFmhTJwoXpA3h8l5alYCQEmwKY0C6GeKxgGTCRxd7Di7JCnc9DYRiKHFWcKlWSBEvoY3AdAy7GAagOIBZ2piqKQBhpUC2SuwUyxWKhDBjSvmVXCdNsr9NMBbSzMdI+00jXEaGc4CLEsNrzLDzE/8gtc8gPkZM2uq9mt6OFYSAdyqS7RKjRTHeJdOBNS2fdn1UPHlfyvyKbzXA7xsntPUo5W8EN64/RaZAKArXDJ0jbYxyi8D5HrA7kxPlUqz6FO4GNk1EbA1PF8O8DhdXWA9EVgIcmYso4PkuKo8E6gGltERh/vQOPulWQkAfUKkJSruBNWNbyJgTM1MlIp++R9Df+iJQAgrehWNbvHxOc3SAEQxMjRsCOwRoh6ezQN4GrMLt9Kv1U50n9J9PUBV4lAzPaWa4vh6NCsDwKHGBWlRJmkqVh/JSgCKscEpFoz0tDBOexJ5PYBAm7Q92hkjpkbBT+G9HnAZXvoT5eqENyZZIhCKhlZxjtO4Fu+969u0CYAWoUq4hGcRmKHIlgrYJRJLrZCrVeprs5IA4mta6RAV21G8h2mzAM+TM8y27iE67ucBwfBuE2cKep1hztVEwM4wR1FIv2Jw0LtupvOAn9YNnHUDZ93AWb8A/AN4HAw5z2fBbAAAAABJRU5ErkJggg=="
                  }
                }

              };

              //console.log(JSON.stringify(respostaData, null, 2));

              const responseRetorno = await axios.post(
                'http://enviabolatv.tangram.app.br/rotina_gera_carteirinha/api/proc_envio_boleto_pix_itau_retorno.php',
                respostaData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
              );

              //console.log(responseRetorno.data);
                
              const listaRetorno = responseRetorno.data;

              //console.log('listaRetorno.id_retorno: ', listaRetorno.id_retorno);

              if(listaRetorno.id_retorno == 0){

                //console.log('Registro de retorno salvo com sucesso.');

              }else{

                const mensagem_erro = {
                  codAcao: 2,
                  msgInterna: "Erro",
                  msgExterna: "Erro interno ao salvar o retorno no banco.",
                  msgExternaExibir: "1",
                  statusVersao: 1,
                  statusVersaoMsg: "Erro interno ao salvar o retorno no banco"
                };
      
                return res.status(200).json(mensagem_erro);
        
              }         


            });      

          }else{

            const mensagem_erro = {
              codAcao: 2,
              msgInterna: "Erro",
              msgExterna: "Erro interno ao selecionar dados do banco.",
              msgExternaExibir: "1",
              statusVersao: 1,
              statusVersaoMsg: "Erro interno ao selecionar dados no banco"
            };
  
           return res.status(200).json(mensagem_erro);

          }                

      }else{

          const mensagem_erro = {
            codAcao: 2,
            msgInterna: "Erro",
            msgExterna: "Erro interno ao salvar o envio no banco.",
            msgExternaExibir: "1",
            statusVersao: 1,
            statusVersaoMsg: "Erro interno ao salvar o envio no banco"
        };

        return res.status(200).json(mensagem_erro);

      }    

      console.log('Processo realizado com sucesso.');
      
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
            msgInterna: "Erro",
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
