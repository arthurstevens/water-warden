const express = require('express');
const path = require('path');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../client/views'));

// Static files
app.use(express.static(path.join(__dirname, '../client/public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');
const adminRouter = require('./routes/admin'); 

app.use('/', indexRouter);
app.use('/api', apiRouter);
app.use('/admin', adminRouter)

app.use((req, res) => res.status(404).send('Page not found.'));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});