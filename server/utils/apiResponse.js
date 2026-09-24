/**
 * Standard API Response Helper
 */
const successResponse = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error ? (error.message || error) : null
  });
};

module.exports = {
  successResponse,
  errorResponse
};
