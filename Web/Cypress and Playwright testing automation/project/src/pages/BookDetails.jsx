import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useBooks } from '../contexts/BookContext';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { favorites, toggleFavorite, downloadBook } = useBooks();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const isFavorite = favorites.some(fav => fav._id === id);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/books/${id}`);
        setBook(response.data);
      } catch (error) {
        console.error('Error fetching book:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, navigate]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      await toggleFavorite(book._id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDownload = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setDownloadLoading(true);
    try {
      await downloadBook(book._id, book.title);
    } catch (error) {
      console.error('Error downloading book:', error);
    } finally {
      setDownloadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600">Book not found</h2>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 btn-primary"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button 
        onClick={() => navigate(-1)}
        className="mb-6 text-primary-600 hover:text-primary-700 flex items-center"
      >
        ← Back
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Book Cover */}
          <div className="md:flex-shrink-0">
            <div className="h-96 w-full md:w-80 bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-8xl mb-4">📖</div>
                <h3 className="text-xl font-semibold text-gray-800">{book.title}</h3>
              </div>
            </div>
          </div>

          {/* Book Details */}
          <div className="p-8 flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                <p className="text-xl text-gray-600 mb-2">by {book.author}</p>
                
                <div className="flex items-center space-x-4 mb-4">
                  <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                    {book.category}
                  </span>
                  <div className="flex items-center">
                    <span className="text-yellow-500 text-lg">⭐</span>
                    <span className="text-gray-600 ml-1">{book.rating}</span>
                  </div>
                </div>
              </div>

              {isAuthenticated && (
                <button
                  onClick={handleFavoriteToggle}
                  className={`p-2 rounded-full text-2xl transition-colors ${
                    isFavorite 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  {isFavorite ? '❤️' : '🤍'}
                </button>
              )}
            </div>

            <div className="prose prose-gray max-w-none mb-6">
              <p className="text-gray-700 leading-relaxed">{book.description}</p>
            </div>

            <div className="flex items-center justify-between mb-6 text-sm text-gray-500">
              <span>📥 {book.downloadCount} downloads</span>
              <span>📄 {book.fileType.toUpperCase()}</span>
              <span>📅 {new Date(book.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex space-x-4">
              {isAuthenticated ? (
                <button
                  onClick={handleDownload}
                  disabled={downloadLoading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex-1 md:flex-none"
                >
                  {downloadLoading ? 'Downloading...' : `Download ${book.fileType.toUpperCase()}`}
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="btn-primary flex-1 md:flex-none"
                >
                  Login to Download
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;