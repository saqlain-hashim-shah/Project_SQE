import { useEffect } from 'react';
import { useBooks } from '../contexts/BookContext';
import BookCard from '../components/BookCard';

const Favorites = () => {
  const { favorites, fetchFavorites, loading } = useBooks();

  useEffect(() => {
    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Favorites</h1>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map(book => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">💝</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No favorites yet</h3>
          <p className="text-gray-500">Start adding books to your favorites to see them here</p>
        </div>
      )}
    </div>
  );
};

export default Favorites;