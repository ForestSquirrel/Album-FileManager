// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../db-middleware/models/user');
const bcrypt = require('bcrypt');

// POST /api/v1/users/register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Create new user
    const newUser = await User.create({ username, password });
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/v1/users/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // TODO: Implement session handling or JWT for maintaining user session
    // For now, we'll just return a success message

    return res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
