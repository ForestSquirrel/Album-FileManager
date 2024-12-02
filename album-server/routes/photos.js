// routes/photos.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = require('../file-middleware/multer-config'); // Import multer configuration

const {Folder, Photo} = require('../db-middleware/models');

const path = require('path');
const fs = require('fs');

// Upload a new photo
router.post('/', upload.single('photo'), async (req, res) => {
    const { title, folderId, userId } = req.body;
    const file = req.file;
  
    try {
      // Validate input
      if (!file) {
        return res.status(400).json({ message: 'Photo file is required' });
      }
      if (!title) {
        return res.status(400).json({ message: 'Photo title is required' });
      }
      if (!folderId) {
        return res.status(400).json({ message: 'Folder ID is required' });
      }
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
  
      // Check if folder exists and belongs to the user
      const folder = await Folder.findOne({ where: { id: folderId, user_id: userId } });
      if (!folder) {
        return res.status(404).json({ message: 'Folder not found or does not belong to the user' });
      }
  
      // Save photo information to the database
      const newPhoto = await Photo.create({
        title,
        url: 'https://forestsquirrel.me:3001/static/' + file.filename,
        folder_id: folderId,
        user_id: userId,
      });
  
      res.status(201).json({ message: 'Photo uploaded successfully', photo: newPhoto });
    } catch (error) {
      console.error('Error uploading photo:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all photos for a user (optionally filtered by folder)
router.get('/', async (req, res) => {
    const { userId, folderId } = req.query;
  
    try {
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
  
      const whereClause = { user_id: userId };
      if (folderId) {
        whereClause.folder_id = folderId;
      }
  
      const photos = await Photo.findAll({ where: whereClause });
  
      res.status(200).json({ photos });
    } catch (error) {
      console.error('Error fetching photos:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
});

// Rename a photo
router.patch('/:id', async (req, res) => {
    const photoId = req.params.id;
    const { title, userId } = req.body;
  
    try {
      // Validate input
      if (!title) {
        return res.status(400).json({ message: 'Photo title is required' });
      }
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
  
      // Find the photo
      const photo = await Photo.findOne({ where: { id: photoId, user_id: userId } });
  
      if (!photo) {
        return res.status(404).json({ message: 'Photo not found or does not belong to the user' });
      }
  
      // Update the photo title
      photo.title = title;
      await photo.save();
  
      res.status(200).json({ message: 'Photo renamed successfully', photo });
    } catch (error) {
      console.error('Error renaming photo:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
});

// Move a photo to a different folder
router.patch('/:id/move', async (req, res) => {
    const photoId = req.params.id;
    const { folderId, userId } = req.body;
  
    try {
      if (!folderId) {
        return res.status(400).json({ message: 'Folder ID is required' });
      }
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
  
      // Find the photo
      const photo = await Photo.findOne({ where: { id: photoId, user_id: userId } });
  
      if (!photo) {
        return res.status(404).json({ message: 'Photo not found or does not belong to the user' });
      }
  
      // Check if the target folder exists and belongs to the user
      const targetFolder = await Folder.findOne({ where: { id: folderId, user_id: userId } });
  
      if (!targetFolder) {
        return res.status(404).json({ message: 'Target folder not found or does not belong to the user' });
      }
  
      // Update the photo's folder_id
      photo.folder_id = folderId;
      await photo.save();
  
      res.status(200).json({ message: 'Photo moved successfully', photo });
    } catch (error) {
      console.error('Error moving photo:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
});
  
// Delete a photo
router.delete('/:id', async (req, res) => {
    const photoId = req.params.id;
    const { userId } = req.body;
  
    try {
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
  
      // Find the photo
      const photo = await Photo.findOne({ where: { id: photoId, user_id: userId } });
  
      if (!photo) {
        return res.status(404).json({ message: 'Photo not found or does not belong to the user' });
      }
  
      // Delete the photo file from the filesystem
      const filePath = path.join(__dirname, '../uploads/', removePrefix(photo.url, 'https://forestsquirrel.me:3001/static/'));
      console.log(filePath);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting photo file:', err);
        }
      });
  
      // Delete the photo record from the database
      await photo.destroy();
  
      res.status(200).json({ message: 'Photo deleted successfully' });
    } catch (error) {
      console.error('Error deleting photo:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
});

function removePrefix(mainString, prefix) {
  if (mainString.startsWith(prefix)) {
      return mainString.slice(prefix.length);
  }
  return mainString; // Return the original string if the prefix doesn't match
}

module.exports = router;
  
  