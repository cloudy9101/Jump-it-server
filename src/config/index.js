module.exports = {
  server: {
    port: process.env.PORT || 3000
  },
  db: {
    mongoUrl:
      'mongodb+srv://liu:jumpit@jumpit-mepd9.mongodb.net/jumpit?retryWrites=true&w=majority'
  },
  privateKey: 'you can change to whatever i like'
};
