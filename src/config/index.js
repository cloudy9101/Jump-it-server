module.exports = {
  server: {
    port: process.env.PORT || 3000
  },
  db: {
    mongoUrl: 'mongodb://localhost:27017/jumpit',
    testMongoUrl: 'mongodb://localhost:27017/jumpit_test',
  },
  privateKey: 'you can change to whatever you like',
  user: 'liuweltec2000@gmail.com',
  password: 'l8036316'
};
