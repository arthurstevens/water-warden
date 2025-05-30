const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../client/views'));

app.use(express.static(path.join(__dirname, '../client/public')));

app.get('/', (req, res) => {
    res.render('index', {
        title: 'Amanzi Warden',
        header: {
            title: 'Amanzi Warden',
            subtitle: 'Smart Water Monitoring System',
            statusText: {
                network: 'Pending',
                lastUpdated: 'Pending'
            }
        },
        alert: {
            title: 'Pending:',
            description: 'Awaiting response from server.'
        },
        kpiNodeCounts: {
            total: '-',
            normal: '-',
            potentialIssues: '-',
            critical: '-'
        },
        footer: {
            text: 'All rights reserved.',
            email: 'someone@example.com',
            emailText: 'Amanzi Warden',
            year: new Date().getFullYear(),
        }
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});