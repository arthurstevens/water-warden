const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('pages/index', {
        title: 'Water Warden',
        header: {
            title: 'Water Warden',
            subtitle: 'Smart Water Monitoring System'
        }
    });
});

module.exports = router;