const JWT = require("jsonwebtoken");

// Define a secret key for signing tokens
const secret = "$uperMan@123";

/**
 * Create a JWT token for a user.
 *
 * @param {Object} user - The user object.
 * @returns {string} The generated JWT token.
 */
function createTokenForUser(user) {
  // Define the payload with user details
  const payload = {
    _id: user._id,
    email: user.email,
    fullName: user.fullName, 
    profileImageURL: user.profileImageURL,
  };

  // Sign the payload with the secret key to create a token
  const token = JWT.sign(payload, secret);
  return token;
}

/**
 * Validate a JWT token and extract the payload.
 *
 * @param {string} token - The JWT token to validate.
 * @returns {Object} The decoded payload.
 */
function validateToken(token) {
  // Verify the token using the secret key and return the decoded payload
  const payload = JWT.verify(token, secret);
  return payload;
}

module.exports = {
  createTokenForUser,
  validateToken,
};
