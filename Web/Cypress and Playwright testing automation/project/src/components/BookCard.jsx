import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBooks } from '../contexts/BookContext';

const BookCard = ({ book }) => {
  const { user, isAuthenticated } = useAuth();
  const { favorites, toggleFavorite, downloadBook } = useBooks();
  const [isLoading, setIsLoading] = useState(false);

  const isFavorite = favorites.some(fav => fav._id === book._id);

  const handleFavoriteToggle = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    
    try {
      await toggleFavorite(book._id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      await downloadBook(book._id, book.title);
    } catch (error) {
      console.error('Error downloading book:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="book-card overflow-hidden">
      <Link to={`/book/${book._id}`}>
        <div className="aspect-w-3 aspect-h-4 bg-gradient-to-br from-primary-100 to-secondary-100 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📖</div>
            <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{book.title}</h3>
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/book/${book._id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-primary-600">
            {book.title}
          </h3>
        </Link>
        
        <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
            {book.category}
          </span>
          <div className="flex items-center">
            <span className="text-yellow-500 text-sm">⭐</span>
            <span className="text-sm text-gray-600 ml-1">{book.rating}</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{book.description}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>📥 {book.downloadCount}</span>
          <span>{book.fileType.toUpperCase()}</span>
        </div>
        
        <div className="flex space-x-2">
          {isAuthenticated && (
            <>
              <button
                onClick={handleDownload}
                disabled={isLoading}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Downloading...' : 'Download'}
              </button>
              
              <button
                onClick={handleFavoriteToggle}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  isFavorite 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isFavorite ? '❤️' : '🤍'}
              </button>
            </>
          )}
          
          {!isAuthenticated && (
            <Link 
              to="/login" 
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium text-center transition-colors"
            >
              Login to Download
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;