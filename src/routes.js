const express = require('express');
const BolecodeController = require('./controllers/BolecodeController');

const routes = express.Router();

//BOLECODE
routes.post('/itau/bolecode/GeraOAuth/', BolecodeController.GeraOAuth);
routes.post('/itau/bolecode/GeraBoletoPix/', BolecodeController.GeraBoletoPix);


module.exports = routes;