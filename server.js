const express = require('express');
const logger = require('morgan');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const PORT = process.env.PORT || 3032;
const app = express();

const ltiRoute = require('./routes/lti');
const indexRoute = require('./routes/index');

app.use(express.static(path.join(__dirname, 'pubic')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.enable('trust proxy'); // this lets req.proto == 'https'
app.use(
  session({
    secret: 'TKRv0IJs=HYqrvagQ#&!F!%V]Ww/4KiVs$s,<<MX',
    resave: true,
    saveUninitialized: true,
  }),
);

app.use('/', indexRoute);
app.use('/lti', ltiRoute);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(`${__dirname}/src/public/index.html`));
});

app.listen(PORT, err =>
  console.log(err || `server running on ${PORT}`),
);
