module.exports = {
  server: {
    port: process.env.PORT || 3000
  },
  db: {
    mongoUrl: 'mongodb://localhost:27017/jumpit'
  },
  privateKey: 'you can change to whatever you like'
};
