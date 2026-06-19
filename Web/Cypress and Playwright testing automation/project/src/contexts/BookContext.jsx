import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BookContext = createContext();

export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
};

export const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Fetch books with filters
  const fetchBooks = async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.author) params.append('author', filters.author);
      if (filters.page) params.append('page', filters.page);

      const response = await axios.get(`http://localhost:5000/api/books?${params}`);
      setBooks(response.data.books);
      return response.data;
    } catch (error) {
      console.error('Error fetching books:', error);
      return { books: [], totalPages: 0, currentPage: 1 };
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/books/meta/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch user favorites
  const fetchFavorites = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/books/user/favorites');
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  // Toggle favorite
  const toggleFavorite = async (bookId) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/books/${bookId}/favorite`);
      
      // Update local favorites state
      if (response.data.isFavorite) {
        const bookResponse = await axios.get(`http://localhost:5000/api/books/${bookId}`);
        setFavorites(prev => [...prev, bookResponse.data]);
      } else {
        setFavorites(prev => prev.filter(book => book._id !== bookId));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  };

  // Download book
  const downloadBook = async (bookId, title) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/books/${bookId}/download`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.pdf`); // You might want to get the actual file extension
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Download started' };
    } catch (error) {
      console.error('Error downloading book:', error);
      return { success: false, message: 'Download failed' };
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const value = {
    books,
    loading,
    categories,
    favorites,
    fetchBooks,
    fetchCategories,
    fetchFavorites,
    toggleFavorite,
    downloadBook
  };

  return (
    <BookContext.Provider value={value}>
      {children}
    </BookContext.Provider>
  );
};