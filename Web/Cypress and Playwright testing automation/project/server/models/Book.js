import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Romance', 'Mystery', 'Fantasy', 'Other']
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  coverImage: {
    type: String,
    default: ''
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'epub']
  },
  fileSize: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Index for search functionality
bookSchema.index({ title: 'text', author: 'text', description: 'text' });

export default mongoose.model('Book', bookSchema);