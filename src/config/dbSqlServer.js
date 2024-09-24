const dbSqlServer = {
  server: '201.30.147.152', // ou o endereço do seu servidor SQL Server
  user: 'TGM_SA',
  password: 'M0b1l3S@T4ngr4m',
  database: 'ativia_saude',
  options: {
    encrypt: false, // Use true se necessário
  },
};

module.exports = dbSqlServer;
