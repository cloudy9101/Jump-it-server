const firebaseAdmin = require('firebase-admin');
const _ = require('lodash');
const FcmToken = require('../models/FcmToken');

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.applicationDefault()
});

const Firebase = {
  /*
    msg = {
      notification: {
        title: '$GOOG up 1.43% on the day',
        body: '$GOOG gained 11.80 points to close at 835.67, up 1.43% on the day.',
      }, // Works on all platform
      data: {}, // Optional, won't show to user, Works on all platform
      android: {
        ttl: 3600 * 1000,
        notification: {
          icon: 'stock_ticker_update',
          color: '#f45342',
        },
      }, // Optional, Works on android
      apns: {
        payload: {
          aps: {
            badge: 42,
          },
        },
      }, // Optional, Works on iOS
      topic: 'industry-tech' // Optional, see firebase clouding message `topic` document
    };
  */
  notify: async function(user, msg) {
    const fcmTokens = await FcmToken.find({ userId: user._id });
    const tokens = fcmTokens.map((fcmToken) => {
      return fcmToken.token;
    });
    if(tokens.length === 0) { return; }

    msg.tokens = _.uniq(tokens);

    let response;
    try {
      response = await firebaseAdmin.messaging().sendMulticast(msg)
      console.log('Successfully sent message:', response);
    } catch (error) {
      response = error;
      console.log('Error sending message:', error);
    }
    return response;
  }
}

module.exports = Firebase;
