import express from 'express';
import path from 'path';
import Book from '../models/Book.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all books with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, category, author, search } = req.query;
    const limit = 12;
    const skip = (page - 1) * limit;

    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (author) {
      query.author = new RegExp(author, 'i');
    }

    if (search) {
      query.$text = { $search: search };
    }

    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip);

    const totalBooks = await Book.countDocuments(query);

    res.json({
      books,
      totalPages: Math.ceil(totalBooks / limit),
      currentPage: parseInt(page),
      totalBooks
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Download book (protected route)
router.get('/:id/download', authenticate, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Increment download count
    book.downloadCount += 1;
    await book.save();

    const filePath = path.resolve(book.filePath);
    res.download(filePath, `${book.title}.${book.fileType}`);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add/Remove from favorites
router.post('/:id/favorite', authenticate, async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const isFavorite = user.favorites.includes(bookId);

    if (isFavorite) {
      user.favorites = user.favorites.filter(id => id.toString() !== bookId);
    } else {
      user.favorites.push(bookId);
    }

    await user.save();

    res.json({ 
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites',
      isFavorite: !isFavorite 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's favorites
router.get('/user/favorites', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Book.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;