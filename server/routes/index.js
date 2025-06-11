const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('pages/index', {
        title: 'Amanzi Warden',
        header: {
            title: 'Amanzi Warden',
            subtitle: 'Smart Water Monitoring System'
        }
    });
});

module.exports = router;