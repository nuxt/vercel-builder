const accesslog = require('access-log')

module.exports = (req, res, next) => {
  accesslog(req, res)
  next()
}
