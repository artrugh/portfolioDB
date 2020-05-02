const express = require('express');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');

const app = express();
const cors = require('cors');

// Initialize middleware
app.use(express.json({ extended: false }));
// manage the delete function, over riding it
app.use(methodOverride('_method'))

// engine
app.set('view engine', 'ejs');

// cookies
app.use(cookieParser());
app.use(cors());
app.use(cors({
    origin: ['http://localhost:4000'],
    credentials: true
}));


app.use('/', require('./routes/dashboard'));
app.use('/', require('./routes/files'));
app.use('/', require('./routes/projects'));
app.get('/', (req, res) => res.render('login'));

/** ERROR HANDLING */
app.use(function (req, res, next) {
    const err = new Error('Problems with the server');
    next(err);
});

app.use(function (err, req, res, next) {
    res.status(400).send({
        error: {
            message: err.message
        }
    });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server started in port ${PORT}`));