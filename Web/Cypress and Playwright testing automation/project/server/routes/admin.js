import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Book from '../models/Book.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/epub+zip') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and ePub files are allowed'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Get all books (admin)
router.get('/books', authenticate, adminOnly, async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new book
router.post('/books', authenticate, adminOnly, upload.single('bookFile'), async (req, res) => {
  try {
    const { title, author, description, category, rating } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Book file is required' });
    }

    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const fileType = fileExtension === '.pdf' ? 'pdf' : 'epub';

    const book = new Book({
      title,
      author,
      description,
      category,
      rating: rating || 0,
      filePath: req.file.path,
      fileType,
      fileSize: req.file.size
    });

    await book.save();

    res.status(201).json({ message: 'Book added successfully', book });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update book
router.put('/books/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const { title, author, description, category, rating } = req.body;

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, description, category, rating },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ message: 'Book updated successfully', book });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete book
router.delete('/books/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Delete the file from filesystem
    if (fs.existsSync(book.filePath)) {
      fs.unlinkSync(book.filePath);
    }

    await Book.findByIdAndDelete(req.params.id);

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;