const bcrypt = require('bcrypt');
const RestResponse = require('../utils/RestResponse');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../config');
const HighBlood = require('../models/HighBlood');
const SugarIntake = require('../models/SugarIntake');

const saveMeasure = async (req, res) => {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;
  const { low, high, value, date } = req.body;
  let today = moment(date, 'DD-MM-YYYY').toDate();

  const resultOfHighBlood = await HighBlood.findOne({
    userId: curUserId,
    date: today
  });
  const resultOfSugar = await SugarIntake.findOne({
    userId: curUserId,
    date: today
  });

  if (!resultOfHighBlood || !resultOfSugar) {
    const curHighBlood = new HighBlood({
      userId: curUserId,
      low,
      high,
      date: today
    });

    const curSugarIntake = new SugarIntake({
      userId: curUserId,
      value,
      date: today
    });
    await curHighBlood.save();
    await curSugarIntake.save();
  } else {
    const curlow = getLow(low, resultOfHighBlood.low);
    const curhigh = getHigh(high, resultOfHighBlood.high);
    const curSugar = getSugar(value, resultOfSugar, value);

    await HighBlood.updateOne(
      { userId: curUserId, date: today },
      { low: curlow, high: curhigh }
    );

    await SugarIntake.updateOne(
      { userId: curUserId, date: today },
      { value: curSugar }
    );
  }

  res.json(RestResponse.Success('Success..'));
};

const readHighBlood = async (req, res) => {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;

  const { date, type } = req.params;

  const { first, last, dateArr } = getDateQueryInfo(type, date);

  const result = await HighBlood.find(
    {
      userId: curUserId,
      date: { $lte: last, $gte: first }
    },
    { userId: false, _id: false } //
  );
  if (!result) {
    throw new NotFound('Data not found');
  }
  const labels = getLabels(type);

  let low = [];
  let high = [];
  // moment(dateArr[0])
  // .endOf('month')
  // .get('date')

  dateArr.forEach(d => {
    let flag = true;
    result.forEach(v => {
      if (d.getTime() === v.date.getTime()) {
        low.push(v.low);
        high.push(v.high);
        flag = false;
      }
    });
    if (flag) {
      low.push(0);
      high.push(0);
    }
  });

  const payload = {
    labels,
    datasets: [
      {
        data: high
      },
      {
        data: low
      }
    ]
  };
  res.json(RestResponse.Success(payload));
};

function getDateQueryInfo(type, date) {
  let dateArr = [];
  switch (type.toUpperCase()) {
    case 'WEEK': {
      const first = moment(date, 'DD-MM-YYYY')
        .startOf('week')
        .toDate();
      const last = moment(date, 'DD-MM-YYYY')
        .endOf('week')
        .toDate();
      dateArr.push(first);
      for (let i = 1; i < 7; i++) {
        dateArr.push(
          moment(first)
            .add(i, 'd')
            .toDate()
        );
      }
      return { first, last, dateArr };
    }
    case 'MONTH': {
      const first = moment(date, 'DD-MM-YYYY')
        .startOf('month')
        .toDate();
      const last = moment(date, 'DD-MM-YYYY')
        .endOf('month')
        .toDate();
      let length = moment(first)
        .endOf('month')
        .get('date');
      dateArr.push(first);
      for (let i = 1; i < length; i++) {
        dateArr.push(
          moment(first)
            .add(i, 'd')
            .toDate()
        );
      }
      return { first, last, dateArr };
    }
    case 'YEAR': {
      const first = moment(date, 'DD-MM-YYYY')
        .startOf('year')
        .toDate();
      const last = moment(date, 'DD-MM-YYYY')
        .endOf('year')
        .toDate();

      return { first, last, dateArr };
    }
  }
}

const readSugar = async (req, res) => {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;
  const { date, type } = req.params;

  const labels = getLabels(type);
  const { first, last, dateArr } = getDateQueryInfo(type, date);
  const result = await SugarIntake.find(
    {
      userId: curUserId,
      date: { $lte: last, $gte: first }
    },
    { userId: false, _id: false } //
  );

  if (!result) {
    throw new NotFound('Data not found');
  }
  let data = [];
  dateArr.forEach(d => {
    let flag = true;
    result.forEach(v => {
      if (d.getTime() === v.date.getTime()) {
        data.push(v.value);
        flag = false;
      }
    });
    if (flag) {
      data.push(0);
    }
  });

  res.json(
    RestResponse.Success({
      labels,
      datasets: [{ data }]
    })
  );
};
function getLabels(type) {
  switch (type.toUpperCase()) {
    case 'WEEK':
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    case 'MONTH':
      return [1, 6, 11, 16, 21, 26, 30];
    case 'YEAR':
      return [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ];
    default:
      break;
  }
}
function getSugar(cur, pre) {
  return parseInt(cur) <= parseInt(pre) ? pre : cur;
}
function getLow(curLow, preLow) {
  return parseInt(curLow) <= parseInt(preLow) ? curLow : preLow;
}
function getHigh(curHigh, preHigh) {
  return parseInt(curHigh) <= parseInt(preHigh) ? preHigh : curHigh;
}
module.exports = { saveMeasure, readHighBlood, readSugar };
