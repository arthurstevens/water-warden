const express = require('express');
const router = express.Router();
const { Client } = require('pg');

function requireAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role) {
        if (req.session.user.role === 'admin') {
            return next();
        } else {
            req.session.messages = { error: 'The account provided does not have access to this page.' };
            return res.redirect('/admin/login');
        }
    }

    return res.redirect('/admin/login');
}

// Admin dashboard
router.get('/', requireAdmin, (req, res) => {
    res.render('pages/admin/dashboard', {
        user: req.session.user,
        title: 'Admin Dashboard',
        header: {
            title: 'Admin Panel',
            subtitle: 'Amanzi Warden'
        }
    });
});

// Admin login page
router.get('/login', (req, res) => {
    res.render('pages/admin/login', {
        title: 'Amanzi Warden',
        login: {
            heading: 'Admin Login',
            subtitle: 'Usage limited to service administrators.'
        }
    });
});

// Create node
router.post('/init-node', requireAdmin, async (req, res) => {
    const { name, token, latitude, longitude } = req.body;

    if (!name || !latitude || !longitude) {
        req.session.messages = { error: 'Missing required fields.' };
        return res.redirect('/admin');
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

        await client.query(
            `INSERT INTO node (name, token, latitude, longitude) VALUES ($1, $2, $3, $4)`,
            [name, token, latitude, longitude]
        );

        req.session.messages = { success: 'Node created successfully.' };
    } catch (err) {
        console.error(err);
        req.session.messages = { error: 'Failed to create node.' };
    } finally {
        await client.end();
        return res.redirect('/admin');
    }
});

// Delete node
router.post('/delete-node', requireAdmin, async (req, res) => {
    const { id } = req.body;

    if (!id) {
        req.session.messages = { error: 'Missing required fields.' };
        return res.redirect('/admin');
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

        await client.query(
            `DELETE FROM node WHERE id = $1`,
            [id]
        );

        req.session.messages = { success: 'Node deleted successfully.' };
    } catch (err) {
        console.error(err);
        req.session.messages = { error: 'Failed to delete node.' };
    } finally {
        await client.end();
        return res.redirect('/admin');
    }
});

// Create announcement
router.post('/post-announcement', requireAdmin, async (req, res) => {
    const { heading, content, severity, initialTime, expiry } = req.body;
    const userID = req.session.user?.id;

    if (!heading || !content || !severity || !initialTime || !expiry || !userID ) {
        req.session.messages = { error: 'Missing required fields.' };
        return res.redirect('/admin');
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

        await client.query(
            `INSERT INTO announcement (heading, content, userID, initialTime, expiry, severity)
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [heading, content, userID, initialTime, expiry, severity]
        );

        req.session.messages = { success: 'Announcement posted successfully.' };
    } catch (err) {
        console.error(err);
        req.session.messages = { error: 'Failed to post announcement.' };
    } finally {
        await client.end();
        return res.redirect('/admin');
    }
});

module.exports = router;
