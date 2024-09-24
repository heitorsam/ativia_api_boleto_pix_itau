const fs = require('fs');
var logFile = fs.createWriteStream('./log.txt', { flags: 'a' });

module.exports = {

    async logErro(args){
        logFile.write(`\n${Date()} - erro: ${args};\n`);
    }
};