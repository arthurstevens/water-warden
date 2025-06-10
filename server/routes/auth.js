const express = require('express');
const router = express.Router();
const { Client } = require('pg');
const bcrypt = require('bcrypt');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

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

        const result = await client.query(
            'SELECT * FROM users WHERE username = $1 LIMIT 1;',
            [username]
        );

        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.passwordhash))) {
            return res.status(401).send('Invalid credentials');
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role,
        };

        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    } finally {
        client.end();
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Failed to logout');
        }

        res.clearCookie('connect.sid');
        res.redirect('/admin/login');
    });
});

module.exports = router;
