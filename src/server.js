const express = require('express');
const logger = require('./controllers/LogController');

try {

    const app = express();
    const routes = require('./routes');
    const bodyParser = require('body-parser');

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());
    app.use(express.json());

    // Middleware para habilitar o CORS
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        next();
    });

    app.use(routes);

    const porta = 1745;

    app.listen(porta, () => {
        console.log('Servidor iniciado na porta:', porta);
    });

} catch (err) {

    logger.logErro(err.toString());
    console.log(err.toString());
    
}
