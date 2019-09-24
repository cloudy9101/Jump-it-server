const { server } = require('./app');
const mongoose = require('mongoose');

module.exports = async () => {
  await mongoose.disconnect();
}
