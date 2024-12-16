const { ensureAuthenticated } = require("../middlewares/authentication");

module.exports = function (app) {
    // Route to render the home page
    app.get("/home", (req, res) => {
        res.render("home.ejs");
    });

    // Route to render the post page
    app.get("/post", (req, res) => {
        res.render("post.ejs");
    });

    // Route to render the about page
    app.get("/about", (req, res) => {
        res.render("about.ejs");
    });

    // Route to render the contact page
    app.get("/contact", (req, res) => {
        res.render("contact.ejs");
    });

    // Route to render the login page
    app.get("/login", (req, res) => {
        res.render("login.ejs");
    });

    // Route to render the register page
    app.get("/register", (req, res) => {
        res.render("register.ejs");
    });

    // Route to render the dashboard page; only accessible to authenticated users
    app.get("/dashboard", ensureAuthenticated, (req, res) => {
        res.render("dashboard.ejs");
    });
};
