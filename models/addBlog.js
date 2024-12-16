const { Schema, model } = require("mongoose");
const slugify = require("slugify");

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageThumbnail: {
      type: String,
      required: false,
    },
    imageFeatured: {
      type: String,
      required: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    category: { 
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true, 
    },
  },
  { timestamps: true }
);

blogSchema.pre("validate", function (next) {
  if (this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

const Blog = model("Blog", blogSchema);

module.exports = Blog;
