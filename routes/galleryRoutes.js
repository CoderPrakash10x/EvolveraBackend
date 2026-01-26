const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { protectAdmin } = require('../middlewares/authMiddleware');
const { createGalleryEvent,deleteGallery, getAllGalleries } = require('../controllers/galleryController');

// 'cover' ek photo lega, 'images' max 20 photos lega
const galleryUpload = upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'images', maxCount: 20 }
]);

router.get('/', getAllGalleries);
router.post('/', protectAdmin, galleryUpload, createGalleryEvent);
router.delete('/:id', protectAdmin, deleteGallery);

module.exports = router;