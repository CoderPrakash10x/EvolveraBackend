const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");
const { protectAdmin } = require("../middlewares/authMiddleware");

const {
  createGalleryEvent,
  getAllGalleries,
  getGalleryById,
  addImagesToGallery,
  deleteGallery,
} = require("../controllers/galleryController");

const galleryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "website_events/gallery",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const galleryUpload = multer({
  storage: galleryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, JPEG, PNG and WEBP allowed"));
    }
    cb(null, true);
  },
  params: {
  folder: "website_events/gallery",
  allowed_formats: ["jpg", "jpeg", "png", "webp", "heic", "heif"],
},
});

const galleryFields = galleryUpload.fields([
  { name: "cover", maxCount: 1 },
  { name: "images", maxCount: 20 },
]);

// ⚠️ ADMIN ROUTES PEHLE — warna /:slug inhe match kar leta hai
router.post("/admin", protectAdmin, (req, res, next) => {
  galleryFields(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, createGalleryEvent);
router.post("/admin", protectAdmin, galleryFields, createGalleryEvent);
router.get("/admin/:id", protectAdmin, getGalleryById);
router.post("/admin/:id/images", protectAdmin, galleryUpload.array("images", 20), addImagesToGallery);
router.delete("/admin/:id", protectAdmin, deleteGallery);

// PUBLIC — baad mein
router.get("/", getAllGalleries);
router.get("/:slug", async (req, res) => {
  try {
    const Gallery = require("../models/GalleryEvent");
    const gallery = await Gallery.findOne({ slug: req.params.slug });
    if (!gallery) return res.status(404).json({ message: "Gallery not found" });
    res.json(gallery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;