const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDupliacteFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value !`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('Invalid Web Token. Please login again', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please login again', 401);
};

const sendErrorDev = (err, req, res) => {
  // FOR API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // FOR RENDERED WEBSITE
  console.log('ERROR : ', err);

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    message: err.message
  });
};

const sendErrorProd = (err, req, res) => {
  // FOR APIS
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      //Operational, trusted error: send message to client
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }

    // Programming error, we dont want to leak error details
    //1) Log error for developers
    console.log('ERROR : ', err);

    //2) Send generic error to clients
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
  // FOR RENDERED WEBSITE
  if (err.isOperational) {
    //Operational, trusted error: send message to client
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      message: err.message
    });
  }
  // Programming error, we dont want to leak error details

  //1) Log error for developers
  console.log('ERROR : ', err);

  //2) Send generic error to clients
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    message: 'Please try again later'
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }

    if (error.code === 11000) {
      error = handleDupliacteFieldsDB(error);
    }

    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }

    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }

    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    sendErrorProd(error, req, res);
  }
};
