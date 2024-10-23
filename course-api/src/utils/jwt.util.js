const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET; // Replace with your actual secret key

// Function to generate a JWT
function generateToken(payload, expiresIn = "1h") {
  return jwt.sign(payload, secretKey, { expiresIn });
}

// Function to verify a JWT
function verifyToken(token) {
  try {
    return jwt.verify(token, secretKey);
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
