const express = require('express');
const { Client } = require('pg');
const router = express.Router();

// Endpoint for receiving node data
router.post('/node-readings', async (req, res) => {
    const data = req.body;

    // Ensure no missing fields
    const requiredFields = ['token', 'timestamp', 'flowrate', 'pressure', 'battery'];
    const missing = requiredFields.filter(f => data[f] === undefined || data[f] === null);

    if (missing.length > 0) {
        return res.status(400).json({ message: "Missing required fields", missing });
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
        await client.query(`SET search_path TO "${process.env.DB_SCHEMA}";`);

        // Find node ID with provided token
        const result = await client.query(`SELECT id FROM node WHERE token = $1 LIMIT 1`, [data.token]);

        // Token matches no nodes
        if (result.rowCount === 0) {
            return res.status(500).json({ error: `Token <${data.token}> matches no nodes.` });
        }

        const nodeid = result.rows[0].id;
		
        // Insert data into node log if token is valid
        const query = `
            INSERT INTO nodeLog (nodeID, timeStamp, flowRate, pressure, battery, temperature, turbidity, totalDissolvedSolids) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
        `;

        await client.query(query, [
            nodeid,
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

// Fetches alerts/announcements
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

        await client.query(`SET search_path TO "${process.env.DB_SCHEMA}";`);

        const result = await client.query('SELECT * FROM activeAnnouncements');

        const formatted = result.rows.map(row => {
            return {
                heading: row.heading,
                content: row.content,
                severity: row.severity,
                initialTime: row.initialtime,
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

// Fetches most recent node data
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
        await client.query(`SET search_path TO "${process.env.DB_SCHEMA}";`);

        const result = await client.query(`SELECT * FROM latestNodeView ORDER BY nodeID;`);

        const formatted = [];
        
        // Assign criticality to nodes and insert into alert_log if abnormal conditions
        for (const node of result.rows) {
            let critical = [node.nodeid,1]; 
            
            // Battery
            if (node.battery < 30) {
                critical[1] = 3;
                critical.push(`Battery: ${node.battery}`);
            } else if (node.battery < 60) {
                critical[1] = 2;
                critical.push(`Battery: ${node.battery}`);
            }

            // Pressure
            if (!(2 <= node.pressure && node.pressure <= 9)) {
                critical[1] = 3;
                critical.push(`Pressure: ${node.pressure}`);
            } else if (!(3 <= node.pressure && node.pressure <= 6)) {
                critical[1] = 2;
                critical.push(`Pressure: ${node.pressure}`);
            }

            // Nodes that measure water quality
            if (node.temperature && node.turbidity && node.tds) { 
                // Temperature
                if (!(15 <= node.temperature && node.temperature <= 25)) {
                    critical[1] = 2;
                    critical.push(`Temperature: ${node.temperature}`);
                } else if (!(0 <= node.temperature && node.temperature <= 30)) {
                    critical[1] = 3;
                    critical.push(`Temperature: ${node.temperature}`);
                }

                // Turbidity
                if (!(node.turbidity <= 5)) {
                    critical[1] = 3;
                    critical.push(`Turbidity: ${node.turbidity}`);
                } else if (!(node.turbidity <= 1)) {
                    critical[1] = 2;
                    critical.push(`Turbidity: ${node.turbidity}`);
                }

                // Total dissolved solids
                if (!(0 <= node.tds && node.tds <= 1200)) {
                    critical[1] = 3;
                    critical.push(`TDS: ${node.tds}`);
                } else if (!(200 <= node.tds && node.tds <= 400)) {
                    critical[1] = 2;
                    critical.push(`TDS: ${node.tds}`);
                }
            };

            // Submit alert if criticality is 2 or 3
            if (critical[1] == 2 || critical[1] == 3) {
                const query = `INSERT INTO alertLog (nodeID, timestamp, reason, severity) VALUES ($1, $2, $3, $4);`;
                
                await client.query(query, [
                    critical[0],
                    new Date(),
                    critical.slice(2),
                    critical[1],
                ]);
            };

            formatted.push({
                name: node.name,
                status: critical[1],
                flowRate: node.flowrate,
                pressure: node.pressure,
                temperature: node.temperature,
                turbidity: node.turbidity,
                tds: node.tds,
                battery: node.battery,
                timestamp: node.timestamp
            });

        };
        
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