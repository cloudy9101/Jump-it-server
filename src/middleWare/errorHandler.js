const errorHandler = function (err, req, res, next) {
  switch(err.constructor) {
    case NotFound:
    case PermissionDeny:
    case UnprocessableEntity:
      res.status(err.status).send(err.message);
      break;
    default:
      console.error(err.stack)
      res.status(500).send('Something broke!')
  }
}

function NotFound(message) {
  this.message = message
  this.status = 404
}

function PermissionDeny(message) {
  this.message = message
  this.status = 403
}

function UnprocessableEntity(message) {
  this.message = message
  this.status = 422
}

module.exports = {
  errorHandler,
  NotFound,
  PermissionDeny,
  UnprocessableEntity
}
