const fs = require('fs');
const axios = require('axios');
const https = require('https');

// Configurações do cliente
const clientId = '75526f47-2bba-4187-a564-c06eeb534a25';
const clientSecret = 'e98ad26c-08f2-4a6e-8cc4-31f5b06c58f3';
// URL do token
const tokenUrl = 'https://sts.itau.com.br/api/oauth/token'; // URL correta

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

module.exports = {
  async GeraOAuth(req, res) {
    try {
      const response = await axios.post(tokenUrl, data, {
        httpsAgent: agent,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
      });

      // Retorna o token
      console.log('Token:', response.data.access_token);
      return res.status(200).json({ access_token: response.data.access_token });
    } catch (error) {
      console.error('Erro ao obter o token:', error);
      
      // Retorna a mensagem de erro
      return res.status(500).json({ message: 'Erro ao obter o token', error });
      
    }
  },
};
