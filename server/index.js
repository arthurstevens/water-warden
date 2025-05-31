const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../client/views'));

app.use(express.static(path.join(__dirname, '../client/public')));

app.get('/', (req, res) => {
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

app.use((req, res) => res.status(404).send('Page not found.'));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});