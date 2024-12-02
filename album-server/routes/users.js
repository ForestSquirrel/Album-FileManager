// routes/users.js
const express = require('express');
const router = express.Router();

const { User, Folder } = require('../db-middleware/models'); // Ensure Folder model is imported
const bcrypt = require('bcrypt');

// POST /api/v1/users/register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ where: { username } });

    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Create the user
    const newUser = await User.create({ username, password });

    // Create the root folder for the user
    const rootFolder = await Folder.create({
      name: `${username}-root`,
      user_id: newUser.id,
      parent_id: null, // Root folder has no parent
    });

    // Return userId and username
    res.status(201).json({
      message: 'User registered successfully',
      userId: newUser.id,
      username: newUser.username,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// POST /api/v1/users/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username' });
    }

    // Compare passwords
    const match = await bcrypt.compare(password, user.password);
    console.log("Login");
    console.log("Password");
    console.log(password);
    console.log("Hashed password");
    console.log(user.password);

    if (!match) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // On successful login, return userId and username
    res.status(200).json({
      message: 'Login successful',
      userId: user.id,
      username: user.username,
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
