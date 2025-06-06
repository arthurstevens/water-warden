const express = require('express');
const path = require('path');
require('dotenv').config();
const { Client } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../client/views'));

app.use(express.static(path.join(__dirname, '../client/public')));

app.get('/', (req, res) => {
    res.render('pages/index', {
        title: 'Amanzi Warden',
        header: {
            title: 'Amanzi Warden',
            subtitle: 'Smart Water Monitoring System'
        },
        footer: {
            text: 'All rights reserved.',
            email: 'someone@example.com',
            emailText: 'Amanzi Warden',
            year: new Date().getFullYear(),
        }
    });
});

app.get('/api/read', async (req, res) => {
    const client = new Client({
        host: process.env.PG_HOST,
        port: process.env.PG_PORT,
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DATABASE,
        ssl: false,
    });

    try {
        await client.connect();
        await client.query(`SET search_path TO "amanzi-warden";`);

        const result = await client.query(`SELECT * FROM nodeView;`);

        const formatted = result.rows.map(row => {
            return {
                nodeid: row.nodeid,
                timestamp: row.timestamp.toISOString().split('T')[0],
                flowRate: row.flowrate,
                pressure: row.pressure,
                battery: row.battery,
                temperature: row.temperature,
                turbidity: row.turbidity,
                totalDissolvedSolids: row.totaldissolvedsolids,
            };
        });

        res.setHeader('Content-Type', 'application/json');
        res.json({nodes: formatted});
    } catch (err) {
        console.error("Caught error:", err);
        res.status(500).send("Internal Server Error");
    } finally {
        await client.end();
    }
});

app.use((req, res) => res.status(404).send('Page not found.'));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});