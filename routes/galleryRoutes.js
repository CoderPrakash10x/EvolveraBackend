const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const { protectAdmin } = require("../middlewares/authMiddleware");

const {
  createGalleryEvent,
  getAllGalleries,
  getGalleryById,
  addImagesToGallery,
  deleteGallery,
} = require("../controllers/galleryController");

const galleryUpload = upload.fields([
  { name: "cover", maxCount: 1 },
  { name: "images", maxCount: 20 },
]);

router.get("/", getAllGalleries);


router.post("/admin", protectAdmin, galleryUpload, createGalleryEvent);

router.get("/admin", protectAdmin, getAllGalleries);

router.get("/admin/:id", protectAdmin, getGalleryById);

router.post(
  "/admin/:id/images",
  protectAdmin,
  upload.array("images", 20),
  addImagesToGallery
);

router.delete("/admin/:id", protectAdmin, deleteGallery);

module.exports = router;
