const express = require('express');
const BolecodeController = require('./controllers/BolecodeController');

const routes = express.Router();

//BOLECODE
routes.post('/itau/bolecode/GeraOAuth/', BolecodeController.GeraOAuth);


module.exports = routes;