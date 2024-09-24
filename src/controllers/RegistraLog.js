//npm install axios
const axios = require('axios');
//const logger = require('./LogController');

console.log('RegistroLog foi chamado');
//logger.logErro('RegistroLog foi chamado');

function logToServer(logData) {
    axios.post('https://tgmpay.tangramapp.com.br/apiatvsaude/api_log.php', logData)
        .then(response => {
            console.log('Log enviado com sucesso.');
            //logger.logErro('Log enviado com sucesso.');
        })
        .catch(error => {
            console.error('Erro ao enviar log para o servidor:', error.message);
            //logger.logErro(error.toString());
        });
}

module.exports = logToServer;
