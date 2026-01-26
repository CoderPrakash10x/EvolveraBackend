const Gallery = require('../models/GalleryEvent');
const slugify = require('slugify');

exports.createGalleryEvent = async (req, res) => {
  try {
    const { title } = req.body;
    
    // Cloudinary se paths nikalna
    const coverPath = req.files['cover'] ? req.files['cover'][0].path : "";
    const imagesPaths = req.files['images'] ? req.files['images'].map(file => file.path) : [];

    const newGallery = await Gallery.create({
      title,
      slug: slugify(title, { lower: true }),
      cover: coverPath,
      images: imagesPaths
    });

    res.status(201).json(newGallery);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllGalleries = async (req, res) => {
  try {
    const galleries = await Gallery.find().sort({ createdAt: -1 });
    res.json(galleries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findByIdAndDelete(req.params.id);

    if (!gallery) {
      return res.status(404).json({ message: "Gallery not found" });
    }

    res.json({ message: "Gallery deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
