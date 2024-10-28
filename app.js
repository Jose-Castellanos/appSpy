require('dotenv').config();
const express = require('express');
const { ApifyClient } = require('apify-client');

// Configura tu API token de Apify
//const APIFY_API_TOKEN = 'apify_api_Wbdqpd0l8rWcYb9SyTPFjszpxqbqnL0ly4tX'; // Reemplaza con tu token
const apiToken = process.env.APIFY_API_TOKEN;
// Inicializa ApifyClient con el token
const client = new ApifyClient({
    token: apiToken,
});


const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());

/**
 * Ruta para ejecutar el scraper
 */
app.post('/scrape', async (req, res) => {
    try {
        
        const {  count, article } = req.body;

        if (!count || !article) {
            return res.status(400).json({
                message: "'count' and 'article' are required."
            });
        }
        

        
        const input = {
            "urls": [
                {
                    "url": `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=CO&search_type=keyword_unordered&media_type=all&q=${encodeURIComponent(article)}`
                }
            ],
            "scrapePageAds.activeStatus": "active",
            "count": count
        };

        // Ejecutar el Actor en Apify
        const run = await client.actor('curious_coder/facebook-ads-library-scraper').call(input);

        // Obtener los resultados de la ejecución desde el dataset
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        // Enviar los resultados como respuesta
        res.json({
            message: 'Scraping completed successfully!',
            data: items,
            datasetUrl: `https://console.apify.com/storage/datasets/${run.defaultDatasetId}`
        });
    } catch (error) {
        console.error('Error while scraping:', error);
        res.status(500).json({ message: 'An error occurred during scraping', error: error.message });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
