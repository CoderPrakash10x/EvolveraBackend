const Gallery = require("../models/GalleryEvent");
const slugify = require("slugify");
const cloudinary = require("../utils/cloudinary");

/* =========================
   CREATE GALLERY (ADMIN)
========================= */
exports.createGalleryEvent = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title required" });
    }

    if (!req.files || !req.files.cover) {
      return res.status(400).json({ message: "Cover image required" });
    }

    const coverFile = req.files.cover[0];

    const images = req.files.images
      ? req.files.images.map((f) => ({
          url: f.path,
          public_id: f.filename,
        }))
      : [];

    const gallery = await Gallery.create({
      title,
      slug: slugify(title + "-" + Date.now(), { lower: true }),
      cover: {
        url: coverFile.path,
        public_id: coverFile.filename,
      },
      images,
    });

    res.status(201).json(gallery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET ALL GALLERIES (ADMIN)
========================= */
exports.getAllGalleries = async (req, res) => {
  try {
    const galleries = await Gallery.find().sort({ createdAt: -1 });
    res.json(galleries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET SINGLE GALLERY
========================= */
exports.getGalleryById = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: "Gallery not found" });
    }
    res.json(gallery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   ADD IMAGES TO GALLERY
========================= */
exports.addImagesToGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
      return res.status(404).json({ message: "Gallery not found" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const newImages = req.files.map((f) => ({
      url: f.path,
      public_id: f.filename,
    }));

    gallery.images.push(...newImages);
    await gallery.save();

    res.json(gallery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   DELETE GALLERY (WITH CLEANUP)
========================= */
exports.deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ message: "Not found" });

    if (gallery.cover?.public_id) {
      await cloudinary.uploader.destroy(gallery.cover.public_id);
    }

    if (Array.isArray(gallery.images)) {
      for (let img of gallery.images) {
        if (img?.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }
    }

    await gallery.deleteOne();
    res.json({ message: "Gallery deleted" });
  } catch (e) {
    console.error("DELETE ERROR:", e);
    res.status(500).json({ message: "Delete failed" });
  }
};

