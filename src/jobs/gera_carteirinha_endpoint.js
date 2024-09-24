const axios = require('axios');
const express = require('express');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint para iniciar o processo
app.get('/iniciar-processo', async (req, res) => {
    try {
        // Endpoint inicial para obter os dados
        const endpoint1 = 'http://wsw.ativia.com.br:8246/app/ativia/chavebeneficiario/';
        const postData = { PARAMETRO: 0 };

        const response1 = await axios.post(endpoint1, postData);
        const dados = response1.data.dados;

        // Processar cada linha de dados
        for (let i = 0; i < dados.length; i++) {
            const chaveBeneficiario = dados[i].CHAVE_BENEFICIARIO;
            
            // Endpoint para gerar a carteirinha
            const endpoint2 = 'http://localhost:8246/app/ativia/geracarteirinhaavegador/';
            const postData2 = { CHAVE_BENEFICIARIO: chaveBeneficiario };

            // Faz a requisição para gerar a carteirinha
            const response2 = await axios.post(endpoint2, postData2);
            
            // Printa na tela a execução
            console.log(`Executando ${i + 1}`);

            // Aguarda um tempo, se necessário
            // await new Promise(resolve => setTimeout(resolve, 1000));
        }

        res.send('Processo concluído');
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).send('Erro ao processar');
    }
});

// Agendamento para executar diariamente às 00:16
cron.schedule('16 0 * * *', () => {
    axios.get('http://localhost:' + PORT + '/iniciar-processo')
        .then(response => {
            console.log('Job executado com sucesso:', response.data);
        })
        .catch(error => {
            console.error('Erro ao executar job:', error);
        });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
