const errorHandler = function(err, req, res, next) {
  switch (err.constructor) {
    case NotFound:
    case PermissionDeny:
    case UnprocessableEntity:
      res.status(err.status).json(err.message);
      break;
    default:
      res.status(500).json('Internal Error..');
      throw err;
  }
};

function NotFound(message) {
  this.message = message;
  this.status = 404;
}

function PermissionDeny(message) {
  this.message = message;
  this.status = 403;
}

function UnprocessableEntity(message) {
  this.message = message;
  this.status = 422;
}

module.exports = {
  errorHandler,
  NotFound,
  PermissionDeny,
  UnprocessableEntity
};
