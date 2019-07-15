const RestResponse = require('../utils/RestResponse');
module.exports = {
  verifyToken: (req, res, next) => {
    const bearHeader = req.headers['authorization'];
    if (typeof bearHeader !== 'undefined') {
      const bearToken = bearHeader.split(' ')[1];
      req.token = bearToken;
      next();
    } else {
      res.status(403).json(RestResponse.Error('No Privilege..'));
    }
  }
};
