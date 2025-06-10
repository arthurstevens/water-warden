const express = require('express');
const router = express.Router();

// Fake auth middleware for now
function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  return res.redirect('/admin/login');
}

// Admin dashboard (protected)
router.get('/', requireAdmin, (req, res) => {
  res.render('pages/admin/dashboard', {
    title: 'Admin Dashboard',
    user: req.session.user
  });
});

// Admin login page (unprotected)
router.get('/login', (req, res) => {
  res.render('pages/admin/login', {
    title: 'Amanzi Warden',
    login: {
      heading: 'Admin Login',
      sub: 'Usage limited to service administrators.'
    },
    footer: {
      text: 'All rights reserved.',
      email: 'someone@example.com',
      emailText: 'Amanzi Warden',
      year: new Date().getFullYear(),
    }
  });
});

module.exports = router;
