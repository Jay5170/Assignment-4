const { Router } = require("express");
const { ensureAuthenticated } = require("../middlewares/authentication");
const Category = require("../models/category");

const router = Router();

// Route to display all categories
router.get("/all-categories", ensureAuthenticated, async (req, res) => {
  try {
    // Fetch all categories from the database
    const categories = await Category.find({});
    // Render the allCategories view and pass the fetched categories
    res.render("allCategories", { categories });
  } catch (error) {
    // Log and handle any errors that occur while fetching categories
    console.error("Error fetching categories:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to get category data for editing
router.get("/edit-category/:id", ensureAuthenticated, async (req, res) => {
  try {
    // Find the category by ID from the request parameters
    const category = await Category.findById(req.params.id);
    // Render the editCategory view and pass the found category
    res.render("editCategory", { category });
  } catch (error) {
    // Log and handle any errors that occur while fetching the category
    console.error("Error fetching category:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to update category data
router.post("/edit-category/:id", async (req, res) => {
  try {
    // Find the category by ID and update it with the data from the request body
    await Category.findByIdAndUpdate(req.params.id, req.body);
    // Redirect to the all-categories page after successful update
    res.redirect("/category/all-categories");
  } catch (error) {
    // Log and handle any errors that occur while updating the category
    console.error("Error updating category:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to delete a category
router.get("/delete-category/:id", ensureAuthenticated, async (req, res) => {
  try {
    // Find the category by ID and delete it from the database
    await Category.findByIdAndDelete(req.params.id);
    // Redirect to the all-categories page after successful deletion
    res.redirect("/category/all-categories");
  } catch (error) {
    // Log and handle any errors that occur while deleting the category
    console.error("Error deleting category:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to render the add new category page
router.get("/add-category", ensureAuthenticated, (req, res) => {
  // Render the addCategory view and pass the authenticated user
  res.render("addCategory", {
    user: req.user,
  });
});

// Route to handle the creation of a new category
router.post("/add-category", async (req, res) => {
  try {
    // Extract the category name from the request body
    const { name } = req.body;
    // Create a new category with the extracted name
    await Category.create({ name });
    // Redirect to the add-category page after successful creation
    return res.redirect("/category/add-category");
  } catch (error) {
    // Log and handle any errors that occur while adding the new category
    console.error("Error adding new category:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
