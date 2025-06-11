const express = require('express');
const router = express.Router();

// Fake auth middleware for now
function requireAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
      return next();
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

module.exports = router;
