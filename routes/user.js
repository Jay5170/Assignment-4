const { Router } = require("express");
const User = require("../models/user");

const router = Router();

// Route to render the login page
router.get("/login", (req, res) => {
  return res.render("login");
});

// Route to render the register page
router.get("/register", (req, res) => {
  return res.render("register");
});

// Route to handle user login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Authenticate user and generate token
    const token = await User.matchPasswordAndGenerateToken(email, password);
    // Set the token as a cookie and redirect to home page
    return res.cookie("token", token, { httpOnly: true }).redirect("/dashboard");
  } catch (error) {
    // Render the login page with an error message
    return res.render("login", {
      error: "Incorrect Email or Password",
    });
  }
});

// Route to handle user logout
router.get("/logout", (req, res) => {
  // Clear the token cookie and redirect to home page
  res.clearCookie("token").redirect("/home");
});

// Route to handle user registration
router.post("/register", async (req, res) => {
  const { fullName, email, password } = req.body;
  // Create a new user with the provided details
  await User.create({ fullName, email, password });
  // Redirect to the login page after successful registration
  return res.redirect("/login");
});

module.exports = router;
