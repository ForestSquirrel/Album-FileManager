// routes/folders.js
const express = require('express');
const router = express.Router();
const {Folder, Photo} = require('../db-middleware/models');

const { sequelize } = require('../db-middleware/pgInstance');

// Create a new folder or subfolder
router.post('/', async (req, res) => {
    const { name, parentId, userId } = req.body;
  
    try {
      // Validate input
      if (!name) {
        return res.status(400).json({ message: 'Folder name is required' });
      }
  
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
  
      // Create the folder
      const newFolder = await Folder.create({
        name,
        user_id: userId,
        parent_id: parentId || null, // null for root folders
      });
  
      res.status(201).json({ message: 'Folder created successfully', folder: newFolder });
    } catch (error) {
      console.error('Error creating folder:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
});
  
// Rename a folder
router.patch('/:id', async (req, res) => {
    const folderId = req.params.id;
    const { name, userId } = req.body;
  
    try {
      // Validate input
      if (!name) {
        return res.status(400).json({ message: 'Folder name is required' });
      }
  
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
  
      // Find the folder
      const folder = await Folder.findOne({ where: { id: folderId, user_id: userId } });
  
      if (!folder) {
        return res.status(404).json({ message: 'Folder not found' });
      }
  
      // Update the folder name
      folder.name = name;
      await folder.save();
  
      res.status(200).json({ message: 'Folder renamed successfully', folder });
    } catch (error) {
      console.error('Error renaming folder:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a folder (and its subfolders and photos)
router.delete('/:id', async (req, res) => {
    const folderId = req.params.id;
    const { userId } = req.body;
  
    try {
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
  
      // Find the folder
      const folder = await Folder.findOne({ where: { id: folderId, user_id: userId } });
  
      if (!folder) {
        return res.status(404).json({ message: 'Folder not found' });
      }

       // Check if the folder is the root folder
      if (folder.parent_id === null) {
        return res.status(400).json({ message: 'Cannot delete the root folder' });
      }
  
      // Delete the folder
      await folder.destroy();
  
      res.status(200).json({ message: 'Folder deleted successfully' });
    } catch (error) {
      console.error('Error deleting folder:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/', async (req, res) => {
  const { userId } = req.query;

  try {
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Execute the recursive query
    const folders = await sequelize.query(
      `
      WITH RECURSIVE folder_hierarchy AS (
        SELECT
          id,
          name,
          user_id,
          parent_id,
          ARRAY[id] AS path
        FROM
          "Folders"
        WHERE
          parent_id IS NULL
          AND user_id = :userId

        UNION ALL

        SELECT
          f.id,
          f.name,
          f.user_id,
          f.parent_id,
          fh.path || f.id
        FROM
          "Folders" f
          INNER JOIN folder_hierarchy fh ON f.parent_id = fh.id
      )
      SELECT
        *
      FROM
        folder_hierarchy
      ORDER BY
        path;
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: { userId },
      }
    );

    // Reconstruct the hierarchy
    const hierarchy = buildFolderHierarchy(folders);

    res.status(200).json({ folders: hierarchy });
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Function to build the folder hierarchy
function buildFolderHierarchy(folders) {
  const folderMap = {};
  const hierarchy = [];

  // Initialize the folder map
  folders.forEach((folder) => {
    folder.subfolders = [];
    folderMap[folder.id] = folder;
  });

  // Build the hierarchy
  folders.forEach((folder) => {
    if (folder.parent_id) {
      const parentFolder = folderMap[folder.parent_id];
      if (parentFolder) {
        parentFolder.subfolders.push(folder);
      }
    } else {
      // Root folders
      hierarchy.push(folder);
    }
  });

  return hierarchy;
}

module.exports = router;
  
