const CronJob = require('cron').CronJob;
const puppeteer = require('puppeteer');

let browser; // Variável global para armazenar a instância do navegador

// Função para inicializar o navegador
async function initializeBrowser() {
    browser = await puppeteer.launch({
        headless: true, // Define se o navegador será visível ou não (false para visível, true para invisível)
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Argumentos para melhorar a compatibilidade
    });
}

// Função para capturar screenshot da página
async function captureScreenshot() {
    const page = await browser.newPage();
    const url = 'http://enviabolatv.tangram.app.br/rotina_gera_carteirinha/index.php?matricula=39693';

    try {
        await page.goto(url, { waitUntil: 'load', timeout: 0 }); // Esperar até que a página esteja completamente carregada
        await new Promise(resolve => setTimeout(resolve, 5000)); // Espera adicional de 7 segundos após o carregamento completo
        await page.screenshot({ path: 'screenshot.png' });
        console.log('Screenshot capturada com sucesso.');

    } catch (error) {
        console.error('Erro ao capturar screenshot:', error);
    } finally {
        await page.close(); // Fechar a página após captura do screenshot
    }
}

// Definindo o cron job para rodar a cada 20 segundos
const job = new CronJob('*/20 * * * * *', async function() {
    // Obtendo a hora atual
    const horaAtual = new Date().toLocaleTimeString();
    console.log(`Job executado às ${horaAtual}`);

    // Verifica se o navegador está inicializado, se não estiver, inicializa
    if (!browser) {
        await initializeBrowser();
    }

    // Captura o screenshot da página
    await captureScreenshot();
});

// Iniciando o job
job.start();

// Mensagem indicando que o job foi iniciado
console.log('Job agendado para rodar a cada 20 segundos');
