const bcrypt = require('bcrypt');
const RestResponse = require('../utils/RestResponse');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../config');
const HighBlood = require('../models/HighBlood');
const SugarIntake = require('../models/SugarIntake');
const StepCount = require('../models/StepCount');
const Distance = require('../models/Distance');
const Floor = require('../models/Floor');

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
    const curSugar = getSugar(value, resultOfSugar.value);

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
      date: {
        $lte: last,
        $gte: first
      }
    },
    { userId: false, _id: false } //
  );
  if (!result) {
    throw new NotFound('Data not found');
  }

  const labels = getLabels(type, dateArr);
  let low = [];
  let high = [];
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
        .add(1, 'd')
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
        .add(1, 'd')
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
        .add(1, 'd')
        .toDate();
      const last = moment(date, 'DD-MM-YYYY')
        .endOf('year')
        .toDate();
      let length = moment(date, 'DD-MM-YYYY').isLeapYear() ? 366 : 365;
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
  }
}

const readSugar = async (req, res) => {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;
  const { date, type } = req.params;

  const { first, last, dateArr } = getDateQueryInfo(type, date);
  const result = await SugarIntake.find(
    {
      userId: curUserId,
      date: {
        $lte: last,
        $gte: first
      }
    },
    { userId: false, _id: false } //
  );

  if (!result) {
    throw new NotFound('Data not found');
  }
  const labels = getLabels(type, dateArr);
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
const readStepCount = async (req, res) => {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;
  const { date, type } = req.params;
  const { first, last, dateArr } = getDateQueryInfo(type, date);

  const result = await StepCount.find(
    {
      userId: curUserId,
      endDate: {
        $lte: last,
        $gte: first
      }
    },
    { userId: false, _id: false }
  );

  if (!result) {
    throw new NotFound('Data not found');
  }
  const labels = getLabels(type, dateArr);
  let data = [];
  dateArr.forEach(d => {
    let flag = true;
    result.forEach(v => {
      if (
        d.getDate() === v.endDate.getDate() &&
        d.getMonth() === v.endDate.getMonth()
      ) {
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
const readFloors = async (req, res) => {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;
  const { date, type } = req.params;
  const { first, last, dateArr } = getDateQueryInfo(type, date);

  const result = await Floor.find(
    {
      userId: curUserId,
      endDate: {
        $lte: last,
        $gte: first
      }
    },
    { userId: false, _id: false }
  );

  if (!result) {
    throw new NotFound('Data not found');
  }
  const labels = getLabels(type, dateArr);

  let data = [];
  dateArr.forEach(d => {
    let flag = true;
    result.forEach(v => {
      if (
        d.getDate() === v.endDate.getDate() &&
        d.getMonth() === v.endDate.getMonth()
      ) {
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
const readDistance = async (req, res) => {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;
  const { date, type } = req.params;
  const { first, last, dateArr } = getDateQueryInfo(type, date);

  const result = await Distance.find(
    {
      userId: curUserId,
      endDate: {
        $lte: last,
        $gte: first
      }
    },
    { userId: false, _id: false }
  );

  if (!result) {
    throw new NotFound('Data not found');
  }
  const labels = getLabels(type, dateArr);

  let data = [];
  dateArr.forEach(d => {
    let flag = true;
    result.forEach(v => {
      if (
        d.getDate() === v.endDate.getDate() &&
        d.getMonth() === v.endDate.getMonth()
      ) {
        data.push(Math.round(v.value));
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
function getLabels(type, arr) {
  switch (type.toUpperCase()) {
    case 'WEEK':
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    case 'MONTH':
      if (arr.length === 30) {
        return [1, 4, 7, 10, 13, 16, 19, 21, 24, 27, 30];
      } else {
        return [1, 4, 7, 10, 13, 16, 19, 21, 24, 27, 31];
      }

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
module.exports = {
  saveMeasure,
  readHighBlood,
  readSugar,
  readStepCount,
  readFloors,
  readDistance
};
