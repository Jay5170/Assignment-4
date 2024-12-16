const { createHmac, randomBytes } = require("crypto");
const { Schema, model } = require("mongoose");
const { createTokenForUser } = require("../services/authentication");

// Define the User schema with Mongoose
const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageURL: {
      type: String,
      default: "/assets/img/default.png",
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash the password if it is modified
userSchema.pre("save", function (next) {
  const user = this;

  // If password is not modified, proceed to the next middleware
  if (!user.isModified("password")) return next();

  // Generate a salt and hash the password
  const salt = randomBytes(16).toString("hex");
  const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

  // Set the salt and hashed password on the user object
  user.salt = salt;
  user.password = hashedPassword;

  next(); // Proceed to save the user
});

// Static method to match password and generate a token
userSchema.static(
  "matchPasswordAndGenerateToken",
  async function (email, password) {
    // Find the user by email
    const user = await this.findOne({ email });
    if (!user) throw new Error("User not found!");

    // Hash the provided password using the user's salt
    const userProvidedHash = createHmac("sha256", user.salt)
      .update(password)
      .digest("hex");

    // Check if the provided password hash matches the stored hash
    if (user.password !== userProvidedHash)
      throw new Error("Incorrect Password");

    // Generate a token for the user
    const token = createTokenForUser(user);
    return token;
  }
);

// Create the User model using the schema
const User = model("user", userSchema);

module.exports = User;
