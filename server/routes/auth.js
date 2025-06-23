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
        await client.query(`SET search_path TO "${process.env.DB_SCHEMA}";`);

        const result = await client.query(
            'SELECT * FROM users WHERE username = $1 LIMIT 1;',
            [username]
        );

        const user = result.rows[0];

        // No data found for given username
        if (!user) {
            req.session.messages = { error: 'Invalid username or password.' };
            return res.redirect('/admin/login');
        }

        // Check hashes match
        const match = await bcrypt.compare(password, user.passwordhash);

        if (!match) {
            req.session.messages = { error: 'Invalid username or password.' };
            return res.redirect('/admin/login');
        }
		
        // If hashes match, create a user session
        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role,
        };

        return res.redirect('/admin');
    } catch (err) {
        console.error('Login error:', err);
        req.session.messages = { error: 'Server error. Please try again.' };
        return res.redirect('/admin/login');
    } finally {
        await client.end();
    }
});

// Logout destorys session
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
