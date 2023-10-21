const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const verifyJwtToken = jwt.verify(token, process.env.JWT_SECRET);

    if (verifyJwtToken.error) {
      return res.status(400).send({
        error: 'Invalid token.',
      });  
    }
    
    req.user = verifyJwtToken;
    return next();
  } catch (error) {
    return res.status(401).send({
      message: 'Authentication failed',
    });
  }
};
