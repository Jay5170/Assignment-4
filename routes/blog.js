const multer = require('multer');
const path = require('path');
const { Router } = require("express");
const Blog = require("../models/addBlog");
const Category = require("../models/category");
const { ensureAuthenticated } = require("../middlewares/authentication");

// Set up storage engine for file uploads
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Initialize multer upload configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 2000000 }, // Limit file size to 2MB
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).fields([
  { name: 'imageThumbnail', maxCount: 1 },
  { name: 'imageFeatured', maxCount: 1 }
]);

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

const router = Router();

// Route to display all blogs
router.get("/all-blogs", ensureAuthenticated, async (req, res) => {
  try {
    const blogs = await Blog.find({}).populate("category", "name");
    const categories = await Category.find({});
    res.render("allBlogs", {
      user: req.user,
      blogs: blogs,
      categories,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to get blog data for editing
router.get("/edit-blog/:id", ensureAuthenticated, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("category", "name");
    const categories = await Category.find({});
    res.render("editBlog", { 
      user: req.user,
      blog: blog, 
      categories 
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to update blog data
router.post("/edit-blog/:id", ensureAuthenticated, async (req, res) => {
  try {
    await Blog.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/blog/all-blogs");
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to delete a blog
router.get("/delete-blog/:id", ensureAuthenticated, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.redirect("/blog/all-blogs");
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to render the add new blog page
router.get("/add-new", ensureAuthenticated, async (req, res) => {
  try {
    const categories = await Category.find({});
    res.render("addBlog", {
      user: req.user,
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to display a single blog based on its slug
router.get("/:slug", async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug }).populate("createdBy", "fullName").populate("category");
    if (!blog) {
      return res.status(404).send("Blog post not found");
    }
    res.render("blog", {
      user: req.user,
      blog,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to handle the creation of a new blog
router.post("/home", ensureAuthenticated, upload, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const imageThumbnail = req.files.imageThumbnail ? `/uploads/${req.files.imageThumbnail[0].filename}` : '';
    const imageFeatured = req.files.imageFeatured ? `/uploads/${req.files.imageFeatured[0].filename}` : '';

    const blog = new Blog({
      title,
      description,
      category,
      imageThumbnail,
      imageFeatured,
      createdBy: req.user._id
    });

    await blog.save();
    res.redirect(`/blog/${blog.slug}`);
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
