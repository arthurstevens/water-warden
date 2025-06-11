const express = require('express');
const { Client } = require('pg');
const router = express.Router();

router.post('/node-readings', async (req, res) => {
    const data = req.body;

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
        await client.query(`SET search_path TO "amanzi-warden";`);

        const result = await client.query(`SELECT id FROM node WHERE token = $1 LIMIT 1`, [data.token]);

        if (result.rowCount === 0) {
            return res.status(500).json({ error: `Token <${data.token}> matches no nodes.` });
        }

        const nodeid = result.rows[0].id;

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
        
        const critical = [0,0]; // Assigning hard-coded positions for nodeID and severity for ease of interpretation

        const formatted = result.rows.map(row => {
            critical[0] = row.nodeid;
            if (!(row.temperature) || !(row.turbidity) || !(row.tds)) { // Node that doesn't report all fields
                if (row.battery < 30) {
                    critical.push(`Battery: ${row.battery}`);
                    critical[1] = 2;
                }
                if (!(2 <= row.pressure && row.pressure <= 9)) {
                    critical[1] = 3;
                    critical.push(`Pressure: ${row.pressure}`);

                    return {
                        name: row.name,
                        status: 3,
                        flowRate: row.flowrate,
                        pressure: row.pressure,
                        temperature: row.temperature,
                        turbidity: row.turbidity,
                        tds: row.tds,
                        battery: row.battery,
                        timestamp: row.timestamp,
                    };
                } else if (!(3 <= row.pressure && row.pressure <= 6)) {
                    critical[1] = 2;
                    critical.push(`Pressure: ${row.pressure}`);

                    return {
                        name: row.name,
                        status: 2,
                        flowRate: row.flowrate,
                        pressure: row.pressure,
                        temperature: row.temperature,
                        turbidity: row.turbidity,
                        tds: row.tds,
                        battery: row.battery,
                        timestamp: row.timestamp,
                    };
                } else {
                    return {
                        name: row.name,
                        status: 1,
                        flowRate: row.flowrate,
                        pressure: row.pressure,
                        temperature: row.temperature,
                        turbidity: row.turbidity,
                        tds: row.tds,
                        battery: row.battery,
                        timestamp: row.timestamp,
                    };
                }
            } else { // Node that reports all fields
                critical[0] = row.nodeid;
                if (row.battery < 30) {
                    critical.push(`Battery: ${row.battery}`);
                    critical[1] = 2;
                }
                if (!(2 <= row.pressure && row.pressure <= 9) || !(0 <= row.temperature && row.temperature <= 30) || !(row.turbidity <= 5) || !(0 <= row.tds && row.tds <= 1200)) {
                    if (!(2 <= row.pressure && row.pressure <= 9)) {
                        critical.push(`Pressure: ${row.pressure}`);
                    }
                    if (!(0 <= row.temperature && row.temperature <= 30)) {
                        critical.push(`Temperature: ${row.temperature}`);
                    }
                    if (!(row.turbidity <= 5)) {
                        critical.push(`Turbidity: ${row.turbidity}`);
                    }
                    if (!(0 <= row.tds && row.tds <= 1200)) {
                        critical.push(`TDS: ${row.tds}`);
                    }

                    critical[1] = 3;

                    return {
                        name: row.name,
                        status: 3,
                        flowRate: row.flowrate,
                        pressure: row.pressure,
                        temperature: row.temperature,
                        turbidity: row.turbidity,
                        tds: row.tds,
                        battery: row.battery,
                        timestamp: row.timestamp,
                    };
                } else if (!(3 <= row.pressure && row.pressure <= 6) || !(15 <= row.temperature && row.temperature <= 25) || !(row.turbidity <= 1) || !(200 <= row.tds && row.tds <= 400)) {
                    if (!(3 <= row.pressure && row.pressure <= 6)) {
                        critical.push(`Pressure: ${row.pressure}`);
                    }
                    if (!(15 <= row.temperature && row.temperature <= 25)) {
                        critical.push(`Temperature: ${row.temperature}`);
                    }
                    if (!(row.turbidity <= 1)) {
                        critical.push(`Turbidity: ${row.turbidity}`);
                    }
                    if (!(200 <= row.tds && row.tds <= 400)) {
                        critical.push(`TDS: ${row.tds}`);
                    }

                    critical[1] = 2;
                    
                    return {
                        name: row.name,
                        status: 2,
                        flowRate: row.flowrate,
                        pressure: row.pressure,
                        temperature: row.temperature,
                        turbidity: row.turbidity,
                        tds: row.tds,
                        battery: row.battery,
                        timestamp: row.timestamp,
                    };
                } else {
                    return {
                        name: row.name,
                        status: 1,
                        flowRate: row.flowrate,
                        pressure: row.pressure,
                        temperature: row.temperature,
                        turbidity: row.turbidity,
                        tds: row.tds,
                        battery: row.battery,
                        timestamp: row.timestamp,
                    };
                }
            };
        });

        // if (critical[1] == 2 || critical[1] == 3) {

        //     const query = `INSERT INTO alertLog (nodeID, timestamp, reason, severity) VALUES ($1, $2, $3, $4);`;
            
        //     await client.query(query, [
        //         critical[0],
        //         new Date(),
        //         critical.slice(2),
        //         critical[1],
        //     ]);
        // };
            
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