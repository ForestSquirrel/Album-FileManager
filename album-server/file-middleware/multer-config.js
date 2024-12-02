// multer-config.js
const multer = require('multer');
const path = require('path');

// Allowed file types
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = function (req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed'));
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;
