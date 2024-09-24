const oracledb = require('oracledb');
const connectionProperties = require('../config/database.js')
const http = require('http');
const axios = require('axios');

const GOOGLE_API_KEY = 'AIzaSyDVNoLjvX2mXFBd7hmKke1RBifTfNaN6Bc'; 

const ibgeCodes = [3550308, 3524402, 3550704, 3530607, 3506359, 3527207, 3518305, 3538006, 3510500, 3518404, 3513405, 3509700, 3502507, 3554102, 3535606, 3546009, 3549904, 3508504];

function doRelease(connection) {
    connection.release(function (err) {
        if (err) {
            console.error(err.message);
        }
    });
}

// Função para formatar a data no formato dd/mm/yyyy
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    let month = (d.getMonth() + 1).toString();
    let day = d.getDate().toString();

    if (month.length === 1) {
        month = '0' + month; // Adiciona zero à esquerda se for necessário
    }
    if (day.length === 1) {
        day = '0' + day; // Adiciona zero à esquerda se for necessário
    }

    return `${day}/${month}/${year}`;

}
function getCoordinates(address) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
    return axios.get(url)
        .then(response => {
            if (response.data && response.data.results && response.data.results.length > 0) {
                //console.log('Dados recebidos:', response.data.results[0]);
                const location = response.data.results[0].geometry.location;
                return {
                    latitude: location.lat,
                    longitude: location.lng
                };
            } else {
                console.error('Nenhum resultado encontrado para o endereço:', address);
                return null;
            }
        })
        .catch(error => {
            console.error('Erro ao obter coordenadas:', error);
            return null;
        });
}

module.exports = {

    async AppGuiaMed(req, res) {
        try {
            const connection = await oracledb.getConnection(connectionProperties);
            await connection.execute(`alter session set nls_date_format = 'dd/mm/yyyy'`, [], { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT });
    
            const dadosform = req.body;
    
            console.log('MATRICULA a pesquisar: ', dadosform.matriculaCod);


            console.log('Buscando chaves cadastradas no SQL SERVER TANGRAM');

            const response = await axios.get('http://enviabolatv.tangram.app.br/rotina_gera_carteirinha/api/select_favoritos_guia_med_matricula.php?matricula='+dadosform.matriculaCod);

            let chavesEncontradas = [];

            if (response.data) {

                chavesEncontradas = response.data.map(item => item.GuiMed_CHAVE);
                console.log('Chaves encontradas:', chavesEncontradas);

            } else {

                console.log('Nenhuma chave encontrada.');

            }

            console.log('NR_SEQ_PLANO a pesquisar: ', dadosform.planoCod);
            console.log('CD_ESPECIALIDADE a pesquisar: ', dadosform.espServCod);
            console.log('COD_IBGE a pesquisar: ', dadosform.cidadeCod);
            console.log('PRESTADOR a pesquisar: ', dadosform.nomPrestador);
            console.log('CRM_NUMERO a pesquisar: ', dadosform.crm);
            console.log('UF a pesquisar: ', dadosform.uf);
            console.log('BAIRRO a pesquisar: ', dadosform.bairro);
    
            console.log('Coletando dados ListaRedeCred...');
    
            let consulta = "";
    
            if (dadosform.NR_SEQ_PLANO == 0) {
                consulta = "SELECT * FROM TASY.ativia_msaude_rede_cred WHERE ROWNUM <= 10";
            } else {
                let VAR_MATRICULA = dadosform.matriculaCod || 'ALL';
                let VAR_NR_SEQ_PLANO = dadosform.planoCod || 'ALL';
                let VAR_CD_ESPECIALIDADE = dadosform.espServCod || 'ALL';
                let VAR_COD_IBGE = dadosform.cidadeCod || 'ALL';
                let VAR_PRESTADOR = dadosform.nomPrestador || 'ALL';
                let VAR_CRM = dadosform.crm || 'ALL';
                let VAR_UF = dadosform.uf || 'ALL';
                let VAR_BAIRRO = dadosform.bairro || 'ALL';
    
                consulta = `SELECT rc.*, esp.DS_ESPECIALIDADE, plan.NM_FANTASIA,
                            coord.CIDADE,
                            coord.LONGITUDE AS LONGITUDE, coord.LATITUDE AS LATITUDE
                            FROM TASY.ativia_msaude_rede_cred rc
                            LEFT JOIN TASY.ativia_msaude_especialidade esp  
                              ON rc.CD_ESPECIALIDADE = esp.CD_ESPECIALIDADE    
                            LEFT JOIN  TASY.ativia_msaude_planos plan
                              ON plan.NR_SEQUENCIA = rc.NR_SEQ_PLANO                                
                            LEFT JOIN TASY.ativia_msaude_end_coordenadas coord
                              ON rc.CD_CEP || '_' || rc.NR_ENDERECO || '_' || rc.DS_ENDERECO = coord.CD_CEP || '_' || coord.NR_ENDERECO || '_' || coord.DS_ENDERECO  
                            WHERE 1=1`;
    
                if (VAR_NR_SEQ_PLANO !== 'ALL' && VAR_NR_SEQ_PLANO !== '0' && VAR_NR_SEQ_PLANO > 0) {
                    consulta += ` AND rc.NR_SEQ_PLANO = ${VAR_NR_SEQ_PLANO}`;
                }
    
                if (VAR_CD_ESPECIALIDADE !== 'ALL' && VAR_CD_ESPECIALIDADE !== '0' && VAR_CD_ESPECIALIDADE > 0) {
                    consulta += ` AND rc.CD_ESPECIALIDADE IN (${VAR_CD_ESPECIALIDADE})`;
                }
    
                if (VAR_COD_IBGE !== 'ALL' && VAR_COD_IBGE !== '0' && VAR_COD_IBGE > 0) {
                    consulta += ` AND rc.COD_IBGE IN (${VAR_COD_IBGE})`;
                }
    
                if (VAR_PRESTADOR !== 'ALL' && VAR_PRESTADOR !== '0') {
                    consulta += ` AND UPPER(rc.PRESTADOR) LIKE UPPER('%${VAR_PRESTADOR}%')`;
                }
    
                if (VAR_CRM !== 'ALL' && VAR_CRM !== '0' && VAR_CRM > 0) {
                    consulta += ` AND rc.CRM_NUMERO IN (${VAR_CRM})`;
                }
    
                if (VAR_UF !== 'ALL' && VAR_UF !== '0') {
                    consulta += ` AND UPPER(rc.ESTADO) = UPPER('${VAR_UF}')`;
                }
    
                if (VAR_BAIRRO !== 'ALL' && VAR_BAIRRO !== '0') {
                    consulta += ` AND UPPER(rc.DS_BAIRRO) LIKE UPPER('%${VAR_BAIRRO}%')`;
                }
    
                consulta += ` ORDER BY esp.DS_ESPECIALIDADE ASC`;
            }
    
            console.log(consulta);
    
            const result1 = await connection.execute(consulta, {}, { outFormat: oracledb.OBJECT });
    
            await connection.close();
    
            if (result1.rows.length === 0) {

                console.error(err.toString());

                console.error('Erro ao processar a solicitação:', err.toString());
    
                const mensagem_erro = {
                    codAcao: 2,
                    msgInterna: "OK",
                    msgExterna: "Filtro não encontrado!",
                    msgExternaExibir: "1",
                    statusVersao: 1,
                    statusVersaoMsg: "Filtro não encontrado!"
                };
    
                return res.status(200).json(mensagem_erro);

            } else {
                    
                const lista = await Promise.all(result1.rows.map(async row => {      

                    return {
                        favorito: chavesEncontradas.includes(row.CHAVE),
                        chave: row.CHAVE,
                        guiaMedicoCod: row.NR_SEQ_PRESTADOR,
                        prestadorNome: row.PRESTADOR || '',
                        prestadorCRM: row.CRM_NUMERO || '',
                        prestadorLocalAtendimento: row.TP_PRESTADOR || '',
                        prestadorLogradouro: row.DS_ENDERECO || '',
                        prestadorNumero: String(row.NR_ENDERECO) || '',
                        prestadorComplemento: row.DS_COMPLEMENTO || '',
                        prestadorBairro: row.DS_BAIRRO || '',
                        cidadeDsc: row.CIDADE || '',
                        prestadorUF: row.ESTADO || '',
                        prestadorCEP: row.CD_CEP || '',
                        prestadorCNPJ: row.CPF_CNPJ || '',
                        prestadorRazaoSocial: row.NOME_PJ || '',
                        listaTelefone: [
                            {
                                prestadorTelefone: row.TELEFONE1 || '',
                                prestadorTelefone2: row.TELEFONE2 || ''
                            }
                        ],
                        prestadorEmail: row.DS_EMAIL || ' ',
                        especialidadeDsc: row.DS_ESPECIALIDADE || '',
                        planoDsc: row.NM_FANTASIA || '',
                        prestadorLongitude: row.LONGITUDE || '', 
                        prestadorLatitude: row.LATITUDE || '',
                        prestadorDistancia: '', // Não existe
                        prestadorQualificacoes: []
                    };
                }));
    
                const resposta = {
                    lista,
                    codAcao: 1,
                    msgInterna: "OK",
                    msgExterna: "",
                    msgExternaExibir: "0",
                    statusVersao: 1,
                    statusVersaoMsg: ""
                };
                return res.status(200).json(resposta);
            }
    
        } catch (err) {
         
            console.error(err.toString());

            console.error('Erro ao processar a solicitação:', err.toString());

            const mensagem_erro = {
                codAcao: 2,
                msgInterna: "OK",
                msgExterna: "Filtro não encontrado!",
                msgExternaExibir: "1",
                statusVersao: 1,
                statusVersaoMsg: "Filtro não encontrado!"
            };

            return res.status(200).json(mensagem_erro);

        }
    },
    
    async AppListaPlanos(req, res) {

        try {

            const connection = await oracledb.getConnection(connectionProperties);
            await connection.execute(`alter session set nls_date_format = 'dd/mm/yyyy'`, [], { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT });  
    
            console.log('Coletando dados AppListaPlano...');

            let consulta = "";

            consulta = 'SELECT NR_SEQUENCIA AS "planoCod", NM_FANTASIA AS "planoDsc" FROM TASY.ativia_msaude_planos ORDER BY NM_FANTASIA ASC';          
            
            console.log(consulta);
    
            const result1 = await connection.execute(consulta, {}, { outFormat: oracledb.OBJECT });
    
            // Libera a conexão
            await connection.close();
    
            // Verifica se há pelo menos um resultado
            if (result1.rows.length === 0) {

                const mensagem_erro = {
                    codAcao: 2,
                    msgInterna: "Nenhum dado encontrado."
                };

                res.status(200).json(mensagem_erro);

            } else {

                
                const lista = result1.rows;
                
                const resposta = {
                    lista,
                    codAcao: 1,
                    msgInterna: "OK",
                    msgExterna: "",
                    msgExternaExibir: "0",
                    statusVersao: 1,
                    statusVersaoMsg: ""
                };
                 
                 res.status(200).json(resposta);

            }

        } catch (err) {

            console.error(err.toString());

            const mensagem_erro = {
                codAcao: 2,
                msgInterna: "Erro interno ao processar a solicitação."
            };

            res.status(500).json(mensagem_erro);
        }
    },

    async AppListaEspecialidades(req, res) {

        try {

            const connection = await oracledb.getConnection(connectionProperties);
            await connection.execute(`alter session set nls_date_format = 'dd/mm/yyyy'`, [], { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT });  
    
            console.log('Coletando dados AppListaEspecialidade...');

            let consulta = "";

            consulta = "SELECT * FROM TASY.ativia_msaude_especialidade ORDER BY DS_ESPECIALIDADE ASC";     

            consulta = 'SELECT CD_ESPECIALIDADE AS "espServCod", DS_ESPECIALIDADE AS "especialidadeDsc" FROM TASY.ativia_msaude_especialidade ORDER BY DS_ESPECIALIDADE ASC';          
            
            console.log(consulta);
    
            const result1 = await connection.execute(consulta, {}, { outFormat: oracledb.OBJECT });
    
            // Libera a conexão
            await connection.close();
    
            // Verifica se há pelo menos um resultado
            if (result1.rows.length === 0) {

                const mensagem_erro = {
                    codAcao: 2,
                    msgInterna: "Nenhum dado encontrado."
                };

                res.status(200).json(mensagem_erro);

            } else {

                
                const lista = result1.rows;
                
                const resposta = {
                    lista,
                    codAcao: 1,
                    msgInterna: "OK",
                    msgExterna: "",
                    msgExternaExibir: "0",
                    statusVersao: 1,
                    statusVersaoMsg: ""
                };
                 
                 res.status(200).json(resposta);

            }

        } catch (err) {

            console.error(err.toString());

            const mensagem_erro = {
                codAcao: 2,
                msgInterna: "Erro interno ao processar a solicitação."
            };

            res.status(500).json(mensagem_erro);
        }
    },

    async AppCidades(req, res) {

        const cities = [];
     
        for (const ibgeCode of ibgeCodes) {
    
            try {
    
                const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${ibgeCode}`);
                const city = response.data;
    
                if (city) {
                    cities.push({
                        cidadeCod: city.id,
                        cidadeDsc: city.nome
                    });
    
                } else {
    
                    cities.push({ COD_IBGE: ibgeCode, NOME: 'Cidade não encontrada' });
    
                }
    
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
        }
    
        // Ordenando as cidades pelo nome em ordem ascendente
        cities.sort((a, b) => (a.cidadeDsc > b.cidadeDsc) ? 1 : ((b.cidadeDsc > a.cidadeDsc) ? -1 : 0));
    
        const lista = cities;
                
        const resposta = {
            lista,
            codAcao: 1,
            msgInterna: "OK",
            msgExterna: "",
            msgExternaExibir: "0",
            statusVersao: 1,
            statusVersaoMsg: ""
        };
            
        res.status(200).json(resposta);
    
    },    

     async AppListaBoletoAbertosPagador(req, res) {

        try {

            const connection = await oracledb.getConnection(connectionProperties);
            await connection.execute(`alter session set nls_date_format = 'dd/mm/yyyy'`, [], { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT });
    
            const dadosform = req.body;
        
            console.log('NR_SEQ_PAGADOR a pesquisar: ', dadosform.NR_SEQ_PAGADOR);
    
            console.log('Coletando dados ListaBoletoAbertosPagador...');

            let consulta = "";

            consulta = `SELECT bol.NR_SEQ_PAGADOR AS MATRICULA, 
                        bol.NR_TITULO AS ID, bol.VL_TITULO AS VALOR,
                        bol.DT_VENCIMENTO AS VENCIMENTO, bol.MES_COMPETENCIA AS COMPETENCIA, det.BANCO,
                        CASE 
                        WHEN bol.STATUS_BOLETO = 'Em aberto' AND SYSDATE > bol.DT_VENCIMENTO THEN 'VENCIDO'
                        WHEN bol.STATUS_BOLETO = 'Em aberto' AND SYSDATE <= bol.DT_VENCIMENTO THEN 'ABERTO'
                        WHEN bol.STATUS_BOLETO = 'Liquidado' THEN 'PAGO'
                        END AS STATUS_BOLETO
                        FROM TASY.ATIVIA_MSAUDE_BOLETOS bol
                        INNER JOIN TASY.ATIVIA_MSAUDE_BOLETOS_DETALHE det
                        ON det.NR_TITULO = bol.NR_TITULO 
                        WHERE STATUS_BOLETO = 'Em aberto'
                        AND bol.NR_SEQ_PAGADOR = `+ dadosform.NR_SEQ_PAGADOR;
                        
            console.log(consulta);
    
            const result1 = await connection.execute(consulta, {}, { outFormat: oracledb.OBJECT });
    
            // Libera a conexão
            await connection.close();
    
            // Verifica se há pelo menos um resultado
            if (result1.rows.length === 0) {

                const mensagem_erro = {
                    codAcao: 2,
                    msgInterna: "Nenhum dado encontrado."
                };

                res.status(200).json(mensagem_erro);

            } else {

                
                const dados = result1.rows;

                dados.forEach(item => {
                    if (item.VENCIMENTO) {
                        item.VENCIMENTO = new Date(item.VENCIMENTO).toISOString().slice(0, 19);
                    }
                });
                
                const resposta = {
                    dados,
                    codAcao: 1,
                    msgInterna: "OK",
                    msgExterna: "",
                    msgExternaExibir: "0",
                    statusVersao: 1,
                    statusVersaoMsg: ""
                };
                 
                res.status(200).json(resposta);

            }

        } catch (err) {

            console.error(err.toString());

            const mensagem_erro = {
                codAcao: 2,
                msgInterna: "Erro interno ao processar a solicitação."
            };

            res.status(500).json(mensagem_erro);
        }
    },

    async AppListaBoletoExtrato(req, res) {

        try {

            const connection = await oracledb.getConnection(connectionProperties);
            await connection.execute(`alter session set nls_date_format = 'dd/mm/yyyy'`, [], { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT });
    
            const dadosform = req.body;
        
            console.log('TITULO a pesquisar: ', dadosform.TITULO);
    
            console.log('Coletando dados AppListaBoletoExtrato...');

            let consulta = "";

            if(dadosform.TITULO == 0){

                consulta = "SELECT * FROM TASY.ativia_msaude_boletos_extrato WHERE ROWNUM <= 10";
            
            }else{

                consulta = "SELECT * FROM TASY.ativia_msaude_boletos_extrato WHERE TITULO = '" + dadosform.TITULO + "' ";

            }
            
            console.log(consulta);
    
            const result1 = await connection.execute(consulta, {}, { outFormat: oracledb.OBJECT });
    
            // Libera a conexão
            await connection.close();
    
            // Verifica se há pelo menos um resultado
            if (result1.rows.length === 0) {

                const mensagem_erro = {
                    codAcao: 2,
                    msgInterna: "Nenhum dado encontrado."
                };

                res.status(200).json(mensagem_erro);

            } else {              

                const dados = result1.rows;

                const resposta = {
                    dados,
                   "impostoRenda": null,
                   "codAcao": 1,
                   "msgInterna": "OK",
                   "msgExterna": "OK",
                   "msgExternaExibir": "1", //1= Exibir mensagem externa
                   "statusVersao": 1,
                   "statusVersaoMsg": ""
                };
                 
                 res.status(200).json(resposta);
            }

        } catch (err) {

            console.error(err.toString());

            const mensagem_erro = {
                "codAcao": 2,
                "msgInterna": "Nenhum dado encontrado."
            };

            res.status(500).json(mensagem_erro);
        }
    },

    async AppListaPlanosPrestador(req, res) {

        try {

            const connection = await oracledb.getConnection(connectionProperties);
            await connection.execute(`alter session set nls_date_format = 'dd/mm/yyyy'`, [], { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT });  
    
            console.log('Coletando dados AppListaPlanosPrestador...');

            const dadosform = req.body;
        
            console.log('guiaMedCod a pesquisar: ', dadosform.guiaMedCod);

            let consulta = "";

            consulta = `SELECT DISTINCT plan.NR_SEQUENCIA AS "planoCod", plan.NM_FANTASIA AS "planoDsc"
                        FROM TASY.ativia_msaude_rede_cred rc 
                        LEFT JOIN  TASY.ativia_msaude_planos plan
                            ON plan.NR_SEQUENCIA = rc.NR_SEQ_PLANO    
                        WHERE rc.NR_SEQ_PRESTADOR = ` + dadosform.guiaMedCod + 
                        ` ORDER BY plan.NM_FANTASIA ASC`;

            console.log(consulta);
    
            const result1 = await connection.execute(consulta, {}, { outFormat: oracledb.OBJECT });
    
            // Libera a conexão
            await connection.close();
    
            // Verifica se há pelo menos um resultado
            if (result1.rows.length === 0) {

                console.error('Nenhum dado encontrado.');

                const mensagem_erro = {
                    codAcao: 2,
                    msgInterna: "OK",
                    msgExterna: "Nenhum dado encontrado.",
                    msgExternaExibir: "1",
                    statusVersao: 1,
                    statusVersaoMsg: "Nenhum dado encontrado."
                };
    
                return res.status(200).json(mensagem_erro);

            } else {

                
                const lista = result1.rows;
                
                const resposta = {
                    lista,
                    codAcao: 1,
                    msgInterna: "OK",
                    msgExterna: "",
                    msgExternaExibir: "0",
                    statusVersao: 1,
                    statusVersaoMsg: ""
                };
                 
                 res.status(200).json(resposta);

            }

        } catch (err) {

            console.error('Erro ao processar a solicitação:', err.toString());

            const mensagem_erro = {
                codAcao: 2,
                msgInterna: "OK",
                msgExterna: "Erro ao processar a solicitação.",
                msgExternaExibir: "1",
                statusVersao: 1,
                statusVersaoMsg: "Erro ao processar a solicitação."
            };

            return res.status(200).json(mensagem_erro);

        }
    },

    async AppListaWebviewLinks(req, res) {

        try {

            const connection = await oracledb.getConnection(connectionProperties);
            await connection.execute(`alter session set nls_date_format = 'dd/mm/yyyy'`, [], { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT });  
    
            console.log('Coletando dados AppListaWebviewLinks...');

            const dadosform = req.body;
        
            console.log('WebCod a pesquisar: ', dadosform.WebCod);

            const response = await axios.get('http://enviabolatv.tangram.app.br/rotina_gera_carteirinha/api/select_weblinks_app.php?webcode='+dadosform.WebCod);

            console.log(response.data);

            /*

            EXEMPLO CONSOLE.LOG

                {
                    WebvId: '6',
                    WebvDescr: 'Description Example',
                    WebvLink: 'http://example.com'
                }


            */

            if (response.data.length === 0) {

                console.error('Nenhum dado encontrado.');

                const mensagem_erro = {
                    codAcao: 2,
                    msgInterna: "OK",
                    msgExterna: "Nenhum dado encontrado.",
                    msgExternaExibir: "1",
                    statusVersao: 1,
                    statusVersaoMsg: "Nenhum dado encontrado."
                };

                return res.status(200).json(mensagem_erro);

            } else {

                
                const lista = response.data;
                
                const resposta = {
                    lista,
                    codAcao: 1,
                    msgInterna: "OK",
                    msgExterna: "",
                    msgExternaExibir: "0",
                    statusVersao: 1,
                    statusVersaoMsg: ""
                };
                 
                 res.status(200).json(resposta);

            }

        } catch (err) {

            console.error('Erro ao processar a solicitação:', err.toString());

            const mensagem_erro = {
                codAcao: 2,
                msgInterna: "OK",
                msgExterna: "Erro ao processar a solicitação.",
                msgExternaExibir: "1",
                statusVersao: 1,
                statusVersaoMsg: "Erro ao processar a solicitação."
            };

            return res.status(200).json(mensagem_erro);

        }
    },

    async AppListaContatos(req, res) {
        try {
            const connection = await oracledb.getConnection(connectionProperties);
            await connection.execute(`alter session set nls_date_format = 'dd/mm/yyyy'`, [], { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT });  
    
            console.log('Coletando dados AppListaContatos...');
    
            const dadosform = req.body;
    
            console.log('webcod a pesquisar: ', dadosform.webcod);
    
            const response = await axios.get('http://enviabolatv.tangram.app.br/rotina_gera_carteirinha/api/select_contatos_app.php?webcode=' + dadosform.webcod);
    
            console.log(response.data);
    
            if (response.data.length === 0) {

                console.log('Nenhum dado encontrado.');

                const mensagem_erro = {
                    codAcao: 2,
                    msgInterna: "OK",
                    msgExterna: "Nenhum dado encontrado.",
                    msgExternaExibir: "1",
                    statusVersao: 1,
                    statusVersaoMsg: "Nenhum dado encontrado."
                };

                return res.status(200).json(mensagem_erro);

            } else {
                const groupedData = response.data.reduce((acc, item) => {
                    const { CntGrp, CntId, CntTit, CntVlr } = item;
                    if (!acc[CntGrp]) {
                        acc[CntGrp] = [];
                    }
                    acc[CntGrp].push({
                        cod: CntId,
                        titulo: CntTit,
                        valor: CntVlr
                    });
                    return acc;
                }, {});
    
                const lista = Object.keys(groupedData).map(key => ({
                    nome: key,
                    subgrupo: groupedData[key]
                }));
    
                const resposta = {
                    lista,
                    codAcao: 1,
                    msgInterna: "OK",
                    msgExterna: "",
                    msgExternaExibir: "0",
                    statusVersao: 1,
                    statusVersaoMsg: ""
                };
    
                res.status(200).json(resposta);
            }
    
        } catch (err) {

            console.error('Erro ao processar a solicitação:', err.toString());

            const mensagem_erro = {
                codAcao: 2,
                msgInterna: "OK",
                msgExterna: "Erro ao processar a solicitação.",
                msgExternaExibir: "1",
                statusVersao: 1,
                statusVersaoMsg: "Erro ao processar a solicitação."
            };

            return res.status(200).json(mensagem_erro);
        }
    },

    async AppListaCoop(req, res) {

        try {

            const connection = await oracledb.getConnection(connectionProperties);
            await connection.execute(`alter session set nls_date_format = 'dd/mm/yyyy'`, [], { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT });
    
            const dadosform = req.body;
        
            console.log('CPF_TITULAR a pesquisar: ', dadosform.CPF_TITULAR);
            console.log('ANO a pesquisar: ', dadosform.ANO);     
            console.log('MATRICULA a pesquisar: ', dadosform.MATRICULA);       
    
            console.log('Coletando dados AppListaCoop...');
    
            let consulta = `
                SELECT TO_CHAR(PERIODO,'MM/YYYY') AS PERIODO, 
                TITULO, 
                SUM(VL) AS VL
                FROM TASY.ativia_msaude_boletos_det_cpar 
                WHERE NR_SEQ_PAGADOR IN (
                    SELECT MAX(NR_SEQ_PAGADOR) AS NR_SEQ_PAGADOR 
                    FROM TASY.ativia_msaude_beneficiarios 
                    WHERE CPF_TITULAR = '` + dadosform.CPF_TITULAR + `'
                )
                AND TO_CHAR(PERIODO,'YYYY') = '` + dadosform.ANO + `'
            `;

            if (dadosform.MATRICULA) {
                consulta += ` AND CARTAO = '` + dadosform.MATRICULA + `'`;
            }

            // Completa o SQL
            consulta += `
                GROUP BY TO_CHAR(PERIODO,'MM/YYYY'), TITULO 
                ORDER BY PERIODO DESC
            `;

            console.log('Consulta SQL:', consulta);
    
            const result1 = await connection.execute(consulta, {}, { outFormat: oracledb.OBJECT });
    
            // Libera a conexão
            await connection.close();
    
            // Verifica se há pelo menos um resultado
            if (result1.rows.length === 0) {

                console.log('Nenhum dado encontrado.');

                const mensagem_erro = {
                    codAcao: 2,
                    msgInterna: "OK",
                    msgExterna: "Nenhum dado encontrado.",
                    msgExternaExibir: "1",
                    statusVersao: 1,
                    statusVersaoMsg: "Nenhum dado encontrado."
                };

                return res.status(200).json(mensagem_erro);

            } else {             
                
                const dados = result1.rows.map(row => {
                    // Formatar o campo VL, se existir
                    if (row.VL) {
                        row.VL = `R$ ${parseFloat(row.VL).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    }
                    
                    // Formatar o campo VL_SERVICO, se existir
                    if (row.VL_SERVICO) {
                        row.VL_SERVICO = `R$ ${parseFloat(row.VL_SERVICO).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    }
                
                    return row;
                });     

                const resposta = {
                dados,
                "codAcao": 1,
                "msgInterna": "OK",
                "msgExterna": "OK",
                "msgExternaExibir": "1", //1= Exibir mensagem externa
                "statusVersao": 1,
                "statusVersaoMsg": ""
                };
                
                res.status(200).json(resposta);
            }

        } catch (err) {

            console.error('Erro ao processar a solicitação:', err.toString());

            const mensagem_erro = {
                codAcao: 2,
                msgInterna: "OK",
                msgExterna: "Erro ao processar a solicitação.",
                msgExternaExibir: "1",
                statusVersao: 1,
                statusVersaoMsg: "Erro ao processar a solicitação."
            };

            return res.status(200).json(mensagem_erro);
        }
    },

    async AppListaCoopDetalhe(req, res) {

        try {

            const connection = await oracledb.getConnection(connectionProperties);
            await connection.execute(`alter session set nls_date_format = 'dd/mm/yyyy'`, [], { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT });
    
            const dadosform = req.body;
        
            //console.log('NR_SEQ_PAGADOR a pesquisar: ', dadosform.NR_SEQ_PAGADOR);
            console.log('TITULO a pesquisar: ', dadosform.TITULO);   
            console.log('MATRICULA a pesquisar: ', dadosform.MATRICULA);           
    
            console.log('Coletando dados AppListaCoopDetalhe...');
    
            let consulta = "select * from TASY.ativia_msaude_boletos_det_cpar where TITULO = '" + dadosform.TITULO + "' ";

            if (dadosform.MATRICULA) {
                consulta += ` AND CARTAO = '` + dadosform.MATRICULA + `'`;
            }
            
            console.log(consulta);
    
            const result1 = await connection.execute(consulta, {}, { outFormat: oracledb.OBJECT });
    
            // Libera a conexão
            await connection.close();
    
            // Verifica se há pelo menos um resultado
            if (result1.rows.length === 0) {

                console.log('Nenhum dado encontrado.');

                const mensagem_erro = {
                    codAcao: 2,
                    msgInterna: "OK",
                    msgExterna: "Nenhum dado encontrado.",
                    msgExternaExibir: "1",
                    statusVersao: 1,
                    statusVersaoMsg: "Nenhum dado encontrado."
                };

                return res.status(200).json(mensagem_erro);

            } else {    
                
                const dados = result1.rows;

                dados.forEach(item => {
                    if (item.PERIODO) {
                        item.PERIODO = new Date(item.PERIODO).toISOString().slice(0, 19);
                    }

                    if (item.DT_REALIZACAO) {
                        item.DT_REALIZACAO = new Date(item.DT_REALIZACAO).toISOString().slice(0, 19);
                    }
                    
                });
                
                // Calcula os totais
                let totalVlServico = dados.reduce((acc, item) => acc + item.VL_SERVICO, 0);

                totalVlServico = totalVlServico ? `R$ ${parseFloat(totalVlServico).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '';
            
                let totalVlCooparticipacao = dados.reduce((acc, item) => acc + item.VL, 0);

                totalVlCooparticipacao = totalVlCooparticipacao ? `R$ ${parseFloat(totalVlCooparticipacao).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '';


                dados.forEach(row => {
                    // Formatar o campo VL, se existir
                    if (row.VL) {
                        row.VL = `R$ ${parseFloat(row.VL).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    }
                    
                    // Formatar o campo VL_SERVICO, se existir
                    if (row.VL_SERVICO) {
                        row.VL_SERVICO = `R$ ${parseFloat(row.VL_SERVICO).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    }
                
                    return row;
                });                

                let linkCooparticipacao = "";
                try {
                    const response = await axios.post('http://wsw.ativia.com.br:8246/app/ativia/GeraCopPdf', {
                        TITULO: dadosform.TITULO,
                        MATRICULA_BENEFICIARIO: dadosform.MATRICULA
                    });

                    console.log(response.data);
    
                    if (response.data && response.data.linkCoparticipacao) {
                        linkCooparticipacao = response.data.linkCoparticipacao;
                        console.log('Link Coparticipação:', linkCooparticipacao);
                    }
                } catch (axiosError) {
                    console.error('Erro ao processar a solicitação:', err.toString());

                    const mensagem_erro = {
                        codAcao: 2,
                        msgInterna: "OK",
                        msgExterna: "Erro ao processar a solicitação.",
                        msgExternaExibir: "1",
                        statusVersao: 1,
                        statusVersaoMsg: "Erro ao processar a solicitação."
                    };
        
                    return res.status(200).json(mensagem_erro);
                }
    
                const resposta = {
                    dados,
                    totalVlServico,
                    totalVlCooparticipacao,
                    linkCooparticipacao,
                    codAcao: 1,
                    msgInterna: "OK",
                    msgExterna: "OK",
                    msgExternaExibir: "1",
                    statusVersao: 1,
                    statusVersaoMsg: ""
                };
                 
                return res.status(200).json(resposta);
            }

        } catch (err) {

            console.error('Erro ao processar a solicitação:', err.toString());

            const mensagem_erro = {
                codAcao: 2,
                msgInterna: "OK",
                msgExterna: "Erro ao processar a solicitação.",
                msgExternaExibir: "1",
                statusVersao: 1,
                statusVersaoMsg: "Erro ao processar a solicitação."
            };

            return res.status(200).json(mensagem_erro);
        }
    },
    
    async AppFavorito(req, res) {
        try {
            const connection = await oracledb.getConnection(connectionProperties);
            await connection.execute(`alter session set nls_date_format = 'dd/mm/yyyy'`, [], { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT });
    
            const dadosform = req.body;
    
            console.log('TOKEN a pesquisar: ', dadosform.token);


            console.log('Buscando chaves favoritadas cadastradas no SQL SERVER TANGRAM');

            const response = await axios.get('http://enviabolatv.tangram.app.br/rotina_gera_carteirinha/api/select_favoritos_guia_med_token.php?token='+dadosform.token);

            let chavesEncontradas = [];
            let chavesStringConsultaSql = '';

            if (response.data) {

                chavesEncontradas = response.data.map(item => item.GuiMed_CHAVE);
                console.log('Chaves favoritadas encontradas:', chavesEncontradas);

                chavesStringConsultaSql = chavesEncontradas.map(chave => `'${chave}'`).join(',');
                console.log('Chaves chavesStringConsultaSql:', chavesStringConsultaSql);

            } else {

                console.log('Nenhum favorito encontrado.');

                const mensagem_erro = {
                    codAcao: 2,
                    msgInterna: "OK",
                    msgExterna: "Nenhum favorito encontrado.",
                    msgExternaExibir: "1",
                    statusVersao: 1,
                    statusVersaoMsg: "Nenhum favorito encontrado."
                };

                return res.status(200).json(mensagem_erro);

            }

            if(chavesStringConsultaSql == ''){

                console.log('Nenhum favorito encontrado.');

                const mensagem_erro = {
                    codAcao: 2,
                    msgInterna: "OK",
                    msgExterna: "Nenhum favorito encontrado.",
                    msgExternaExibir: "1",
                    statusVersao: 1,
                    statusVersaoMsg: "Nenhum favorito encontrado."
                };

                return res.status(200).json(mensagem_erro);

            }
    
            console.log('Coletando dados AppFavorito...');
    
            let consulta = "";    
           
            consulta = `SELECT rc.*, esp.DS_ESPECIALIDADE, plan.NM_FANTASIA,
                        coord.CIDADE,
                        coord.LONGITUDE AS LONGITUDE, coord.LATITUDE AS LATITUDE
                        FROM TASY.ativia_msaude_rede_cred rc
                        LEFT JOIN TASY.ativia_msaude_especialidade esp  
                            ON rc.CD_ESPECIALIDADE = esp.CD_ESPECIALIDADE    
                        LEFT JOIN  TASY.ativia_msaude_planos plan
                            ON plan.NR_SEQUENCIA = rc.NR_SEQ_PLANO                                
                        LEFT JOIN TASY.ativia_msaude_end_coordenadas coord
                            ON rc.CD_CEP || '_' || rc.NR_ENDERECO || '_' || rc.DS_ENDERECO = coord.CD_CEP || '_' || coord.NR_ENDERECO || '_' || coord.DS_ENDERECO  
                        WHERE 1=1
                        AND rc.CHAVE IN (` + chavesStringConsultaSql + `)
                        
                        `;

            console.log(consulta);
    
            const result1 = await connection.execute(consulta, {}, { outFormat: oracledb.OBJECT });
    
            await connection.close();
    
            if (result1.rows.length === 0) {

                console.log('Nenhum dado encontrado.');

                const mensagem_erro = {
                    codAcao: 2,
                    msgInterna: "OK",
                    msgExterna: "Nenhum dado encontrado.",
                    msgExternaExibir: "1",
                    statusVersao: 1,
                    statusVersaoMsg: "Nenhum dado encontrado."
                };

                return res.status(200).json(mensagem_erro);

            } else {
                    
                const lista = await Promise.all(result1.rows.map(async row => {      

                    return {
                        favorito: true,
                        chave: row.CHAVE,
                        guiaMedicoCod: row.NR_SEQ_PRESTADOR,
                        prestadorNome: row.PRESTADOR || '',
                        prestadorCRM: row.CRM_NUMERO || '',
                        prestadorLocalAtendimento: row.TP_PRESTADOR || '',
                        prestadorLogradouro: row.DS_ENDERECO || '',
                        prestadorNumero: String(row.NR_ENDERECO) || '',
                        prestadorComplemento: row.DS_COMPLEMENTO || '',
                        prestadorBairro: row.DS_BAIRRO || '',
                        cidadeDsc: row.CIDADE || '',
                        prestadorUF: row.ESTADO || '',
                        prestadorCEP: row.CD_CEP || '',
                        prestadorCNPJ: row.CPF_CNPJ || '',
                        prestadorRazaoSocial: row.NOME_PJ || '',
                        listaTelefone: [
                            {
                                prestadorTelefone: row.TELEFONE1 || '',
                                prestadorTelefone2: row.TELEFONE2 || ''
                            }
                        ],
                        prestadorEmail: row.DS_EMAIL || ' ',
                        especialidadeDsc: row.DS_ESPECIALIDADE || '',
                        planoDsc: row.NM_FANTASIA || '',
                        prestadorLongitude: row.LONGITUDE || '', 
                        prestadorLatitude: row.LATITUDE || '',
                        prestadorDistancia: '', // Não existe
                        prestadorQualificacoes: []
                    };
                }));
    
                const resposta = {
                    lista,
                    codAcao: 1,
                    msgInterna: "OK",
                    msgExterna: "",
                    msgExternaExibir: "0",
                    statusVersao: 1,
                    statusVersaoMsg: ""
                };
                return res.status(200).json(resposta);
            }
    
        } catch (err) {

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
    },  

    async AppFavoritoAcao(req, res) {

        try {

            const connection = await oracledb.getConnection(connectionProperties);
            await connection.execute(`alter session set nls_date_format = 'dd/mm/yyyy'`, [], { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT });  
    
            console.log('Coletando dados AppFavoritoAcao...');

            const dadosform = req.body;
        
            console.log('token a pesquisar: ', dadosform.token);
            console.log('chave a pesquisar: ', dadosform.chave);
            console.log('modo a pesquisar: ', dadosform.modo);

            const postData = {
                token: dadosform.token,
                chave: dadosform.chave,
                modo: dadosform.modo
            };

            const response = await axios.post(
                'http://enviabolatv.tangram.app.br/rotina_gera_carteirinha/api/update_favorito.php',
                postData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log(response.data);
                
            const lista = response.data;

            console.log('lista.id_retorno', lista.id_retorno);
            
            const resposta = {
                codAcao: lista.id_retorno,
                msgInterna: lista.message,
                msgExterna:lista.message_externa,
                msgExternaExibir: "0",
                statusVersao: 1,
                statusVersaoMsg: ""
            };
                
            res.status(200).json(resposta);

            /*

            if (response.data.length === 0) {

                const mensagem_erro = {
                    codAcao: 2,
                    msgInterna: "Nenhum dado encontrado."
                };

                res.status(200).json(mensagem_erro);

             */
         
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
    },

}