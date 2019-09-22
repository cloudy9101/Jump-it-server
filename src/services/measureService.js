const moment = require('moment');
const HighBlood = require('../models/HighBlood');
const SugarIntake = require('../models/SugarIntake');
const StepCount = require('../models/StepCount');
const Distance = require('../models/Distance');
const Floor = require('../models/Floor');
const saveMeasurement = async (curUserId, low, high, value, date) => {
  const today = moment(date, 'DD-MM-YYYY').toDate();
  const resultOfHighBlood = await HighBlood.findOne({
    userId: curUserId,
    date: today
  });
  const resultOfSugar = await SugarIntake.findOne({
    userId: curUserId,
    date: today
  });
  let result = null;
  if (!resultOfHighBlood || !resultOfSugar) {
    const curHighBlood = new HighBlood({
      userId: curUserId,
      low: parseInt(low),
      high: parseInt(high),
      date: today
    });

    const curSugarIntake = new SugarIntake({
      userId: curUserId,
      value: parseInt(value),
      date: today
    });
    result = await curHighBlood.save();
    result = await curSugarIntake.save();
  } else {
    const curlow = getLow(low, resultOfHighBlood.low);
    const curhigh = getHigh(high, resultOfHighBlood.high);
    const curSugar = getSugar(value, resultOfSugar.value);

    result = await HighBlood.updateOne(
      { userId: curUserId, date: today },
      { low: curlow, high: curhigh }
    );

    result = await SugarIntake.updateOne(
      { userId: curUserId, date: today },
      { value: curSugar }
    );
  }
  return result;
};

const findHB = async (curUserId, date, type) => {
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
  return payload;
};

const findSugar = async (curUserId, date, type) => {
  const { first, last, dateArr } = getDateQueryInfo(type, date);
  const labels = getLabels(type, dateArr);
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
  const payload = {
    labels,
    datasets: [{ data }]
  };
  return payload;
};

const findStep = async (curUserId, date, type) => {
  const { first, last, dateArr } = getDateQueryInfo(type, date);
  const labels = getLabels(type, dateArr);
  let payload = null;
  if (type.toUpperCase() === 'YEAR') {
    let data = [];
    for (let i = 0; i < 12; i++) {
      const result = await StepCount.aggregate([
        {
          $match: {
            startDate: {
              $gte: moment(first)
                .add(i, 'months')
                .toDate(),
              $lte: moment(first)
                .endOf('month')
                .add(i, 'months')
                .toDate()
            }
          }
        },
        { $group: { _id: null, value: { $sum: '$value' } } }
      ]);

      if (result[0] === undefined) {
        data.push(0);
      } else {
        data.push(result[0].value);
      }
    }
    playload = {
      labels,
      datasets: [{ data }]
    };
  } else {
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

    playload = {
      labels,
      datasets: [{ data }]
    };
  }
  return playload;
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
const findFloor = async (curUserId, date, type) => {
  const { first, last, dateArr } = getDateQueryInfo(type, date);
  const labels = getLabels(type, dateArr);
  let payload = null;
  if (type.toUpperCase() === 'YEAR') {
    let data = [];
    for (let i = 0; i < 12; i++) {
      const result = await Floor.aggregate([
        {
          $match: {
            startDate: {
              $gte: moment(first)
                .add(i, 'months')
                .toDate(),
              $lte: moment(first)
                .endOf('month')
                .add(i, 'months')
                .toDate()
            }
          }
        },
        { $group: { _id: null, value: { $sum: '$value' } } }
      ]);

      if (result[0] === undefined) {
        data.push(0);
      } else {
        data.push(result[0].value);
      }
    }
    payload = {
      labels,
      datasets: [{ data }]
    };
  } else {
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
    payload = {
      labels,
      datasets: [{ data }]
    };
  }
  return payload;
};

const findDistance = async (curUserId, date, type) => {
  const { first, last, dateArr } = getDateQueryInfo(type, date);
  const labels = getLabels(type, dateArr);
  let payload = null;
  if (type.toUpperCase() === 'YEAR') {
    let data = [];
    for (let i = 0; i < 12; i++) {
      const result = await Distance.aggregate([
        {
          $match: {
            startDate: {
              $gte: moment(first)
                .add(i, 'months')
                .toDate(),
              $lte: moment(first)
                .endOf('month')
                .add(i, 'months')
                .toDate()
            }
          }
        },
        { $group: { _id: null, value: { $sum: '$value' } } }
      ]);

      if (result[0] === undefined) {
        data.push(0);
      } else {
        data.push(result[0].value);
      }
    }
    payload = {
      labels,
      datasets: [{ data }]
    };
  } else {
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

    payload = {
      labels,
      datasets: [{ data }]
    };
  }
  return payload;
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
  saveMeasurement,
  findHB,
  findSugar,
  findStep,
  findFloor,
  findDistance
};
