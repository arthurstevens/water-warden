const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
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

module.exports = router;