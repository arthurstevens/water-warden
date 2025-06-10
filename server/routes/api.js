const express = require('express');
const { Client } = require('pg');
const router = express.Router();

router.post('/simulate', async (req, res) => {
    const data = req.body;

    // Checking for empty required fields
    if (!data || !data.nodeid || !data.timestamp || !data.flowrate || !data.pressure || !data.battery) {
        const emptyFields = Object.keys(data).filter(key => !data[key]);
        if (emptyFields.length > 0) {
            return res.status(400).json({ message: "Missing required fields", emptyFields });
        }
    }

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

        query = `INSERT INTO nodeLog (nodeID, timeStamp, flowRate, pressure, battery, temperature, turbidity, totalDissolvedSolids) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`;

        await client.query(query, [
            data.nodeid,
            new Date(data.timestamp),
            data.flowrate,
            data.pressure,
            data.battery,
            data.temperature,
            data.turbidity,
            data.totaldissolvedsolids
        ]);
        res.status(200).json({ message: "Data inserted successfully" });

    } catch (err) {
        console.error("DB insert error:", err);
        res.status(500).json({ error: "Database insert failed" });
    } finally {
        client.end();
    }
});

router.get('/read_alert', async (req, res) => {
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

        const result = await client.query('SELECT * FROM activeAnnouncements');

        const formatted = result.rows.map(row => {
            return {
                heading: row.heading,
                content: row.content,
                severity: row.severity,
                initialtime: row.initialtime,
                expiry: row.expiry
            };
        });
        
        res.setHeader('Content-Type', 'application/json');
        res.json({alerts: formatted || null});
    } catch  (err) {
        console.error("DB connection error:", err);
        res.status(500).json({ error: "Database connection failed" });
    } finally {
        client.end();
    }
})

router.get('/read', async (req, res) => {
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

        const result = await client.query(`SELECT * FROM latestNodeView ORDER BY nodeID;`);

        const formatted = result.rows.map(row => {
            return {
                nodeid: row.nodeid,
                name: row.name,
                status: 1, // Needs a function.
                flowRate: row.flowrate,
                pressure: row.pressure,
                temperature: row.temperature,
                turbidity: row.turbidity,
                tds: row.tds,
                longitude: row.longitude,
                latitude: row.latitude,
                timestamp: row.timestamp,
                battery: row.battery
            };
        });

        res.setHeader('Content-Type', 'application/json');
        res.json({nodes: formatted || null});
    } catch (err) {
        console.error("Caught error:", err);
        res.status(500).send("Internal Server Error");
    } finally {
        await client.end();
    }
});

module.exports = router;