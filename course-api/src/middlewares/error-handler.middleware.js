const errorHandler = (err, req, res, next) => {
  // Default status code is 500 (Internal Server Error) if not set
  const statusCode = err.statusCode || 500;

  // Default error message if not provided
  const message = err.message || "Internal Server Error";

  // Log the error for debugging (you can improve this by using logging libraries)
  console.error(err);

  // Respond with error details
  return res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack, // Hide stack trace in production
  });
};

module.exports = errorHandler;
