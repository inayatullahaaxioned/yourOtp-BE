//  dotenv configuration
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const routes = require('./src/routes/routes');

const app = express();

//  db connect when server starts
require('./src/config/dbConfig');

//  require all models in application
require('./src/requireAllmodels');

//  middlewares for req body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use('/api', routes);

app.use('/', (req, res) => res.status(404).send({ message: 'Resource Not Found' }));

const port = process.env.PORT || 5000;

app.listen(port, () => {
  process.stdout.write(`App listening at port ${port} \n`);
});
