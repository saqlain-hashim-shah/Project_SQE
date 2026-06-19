import { useState, useEffect } from 'react';
import { useBooks } from '../contexts/BookContext';
import BookCard from '../components/BookCard';
import SearchFilter from '../components/SearchFilter';

const Home = () => {
  const { books, loading, fetchBooks } = useBooks();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({});

  const handleFilterChange = async (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    const result = await fetchBooks({ ...newFilters, page: 1 });
    setTotalPages(result.totalPages);
  };

  const handlePageChange = async (page) => {
    setCurrentPage(page);
    const result = await fetchBooks({ ...filters, page });
    setTotalPages(result.totalPages);
  };

  useEffect(() => {
    const loadInitialBooks = async () => {
      const result = await fetchBooks({ page: 1 });
      setTotalPages(result.totalPages);
    };
    loadInitialBooks();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-primary-600">BookHaven</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover, download, and enjoy thousands of books across all genres. 
          Your digital library awaits!
        </p>
      </div>

      {/* Search and Filters */}
      <SearchFilter onFilterChange={handleFilterChange} />

      {/* Books Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {books.map(book => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>

          {/* No books found */}
          {books.length === 0 && !loading && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No books found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 border rounded-lg ${
                      currentPage === page
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;