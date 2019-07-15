const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const userRouter = require('./src/routes/UserRouter');
const app = express();
const mongoose = require('mongoose');
const config = require('./src/config');
const { errorHandler } = require('./src/middleWare/errorHandler');

mongoose
  .connect(config.db.mongoUrl, { useNewUrlParser: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/users', userRouter);

app.use(errorHandler)

app.listen(config.server.port, () =>
  console.log(`Server running on port ${config.server.port}`)
);
