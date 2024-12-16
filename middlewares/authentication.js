const { validateToken } = require("../services/authentication");

function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    // Retrieve the token cookie value
    const tokenCookieValue = req.cookies[cookieName];
    
    // If no token is found, proceed to the next middleware
    if (!tokenCookieValue) {
      return next();
    }

    try {
      // Validate the token and add user payload to the request object
      const userPayload = validateToken(tokenCookieValue);
      req.user = userPayload;
    } catch (error) {
      console.error("Token validation failed:", error);
    }

    // Proceed to the next middleware
    return next();
  };
}

function ensureAuthenticated(req, res, next) {
  if (req.user) {
    // User is authenticated, proceed to the next middleware or route handler
    return next();
  } else {
    // User is not authenticated, redirect to the login page
    return res.redirect("/user/login");
  }
}

module.exports = {
  checkForAuthenticationCookie,
  ensureAuthenticated,
};
