require("dotenv").config(); // Load environment variables from .env file

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const ejsMate = require("ejs-mate");

// Import Models
const Blog = require("./models/addBlog");
const Category = require("./models/category");

// Import Routes
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const categoryRoute = require("./routes/category");
const blogerController = require("./controllers/blogerController");

// Middleware for Authentication Cookie
const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");
const addUserToLocals = require("./middlewares/addUserToLocals");

const app = express();
const PORT = process.env.PORT || 8080;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB")) // Log successful connection
  .catch((err) => console.log("Error connecting to MongoDB:", err)); // Log errors

// Set view engine and views directory
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// Middleware to handle static files and parse incoming requests
app.use(express.static(path.join(__dirname, "/public")));
app.use('/blog', express.static(path.join(__dirname, "/public")));
app.use('/user', express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token")); // Middleware to check authentication cookie
app.use(addUserToLocals); // Middleware to add user data to locals
app.use(bodyParser.json()); // Middleware to parse JSON payloads
app.use(bodyParser.urlencoded({ extended: false })); // Middleware to parse URL-encoded payloads

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Define Routes
app.get("/home", async (req, res) => {
  try {
    const allBlogs = await Blog.find({}).populate("createdBy", "fullName").populate("category");
    const categories = await Category.find({});
    res.render("home", {
      user: req.user,
      blogs: allBlogs,
      categories,
      isSearch: false,
    });
  } catch (error) {
    console.error("Error fetching data for home page:", error); // Log errors
    res.status(500).send("Internal Server Error");
  }
});

// Search Route
app.get("/search", async (req, res) => {
  try {
    const { title } = req.query;
    const searchResults = await Blog.find({ title: { $regex: title, $options: "i" } }).populate("createdBy", "fullName").populate("category");
    const categories = await Category.find({});
    res.render("home", {
      user: req.user,
      blogs: searchResults,
      categories,
      isSearch: true,
    });
  } catch (error) {
    console.error("Error searching for blogs:", error); // Log errors
    res.status(500).send("Internal Server Error");
  }
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);
app.use("/category", categoryRoute);
blogerController(app);

// Start the server
app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`)); // Start the server
