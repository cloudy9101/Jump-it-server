const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const userRouter = require('./src/routes/UserRouter');
const app = express();
const mongoose = require('mongoose');
const config = require('./src/config');
const { errorHandler } = require('./src/middleWare/errorHandler');
const asyncHandler = require('./src/utils/asyncHandler');

require('./src/utils/AgendaUtil');

let dbUrl = process.env.mode === 'TESTING' ? config.db.testMongoUrl : config.db.mongoUrl;
mongoose
  .connect(dbUrl, { useNewUrlParser: true })
  .then(() => process.env.mode != 'TESTING' && console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/users', userRouter);

app.use(errorHandler);

if (process.env.mode != 'TESTING') {
  app.listen(config.server.port, () =>
    console.log(`Server running on port ${config.server.port}`)
  );
}

module.exports = { app };
