const Agenda = require('agenda');
const _ = require('lodash');
const config = require('../config');
const Firebase = require('../utils/FirebaseUtil');
const User = require('../models/User');
const Plan = require('../services/Plan');

const agenda = new Agenda({db: {address: config.db.mongoUrl}});

agenda.define('daily exercise plan', (job, done) => {
  job.repeatAt('10:00am');
  User.find().then(users => {
    for (let user of users) {
      const plan = Plan.getExercisePlan(user);
      if(plan.length != 1 || plan[0].name != "Rest") {
        const msg = { notification: { title: "Today's exercise plan", body: _.join(_.map(plan, p => p.name + " - " + p.value), "\n") } }
        Firebase.notify(user, msg);
      }
    }
    done();
  });
});

(async function() { // IIFE to give access to async/await
  await agenda.start();

  // await agenda.every('1 minutes', 'daily exercise plan');
})();
