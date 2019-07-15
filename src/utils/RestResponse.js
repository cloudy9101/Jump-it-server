module.exports = {
  Success: (data, msg = '') => {
    return {
      code: 0,
      data,
      msg
    };
  },
  Error: (msg = 'Internal Error', code = 1) => {
    return {
      code,
      data: {},
      msg
    };
  }
};
