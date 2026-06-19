import { useState, useEffect } from 'react';
import { useBooks } from '../contexts/BookContext';

const SearchFilter = ({ onFilterChange }) => {
  const { categories } = useBooks();
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    author: ''
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { search: '', category: 'all', author: '' };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="form-label">Search Books</label>
          <input
            type="text"
            placeholder="Search by title, author, or keyword..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="form-input"
          />
        </div>

        {/* Category */}
        <div>
          <label className="form-label">Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="form-input"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Author */}
        <div>
          <label className="form-label">Author</label>
          <input
            type="text"
            placeholder="Filter by author..."
            value={filters.author}
            onChange={(e) => handleFilterChange('author', e.target.value)}
            className="form-input"
          />
        </div>

        {/* Clear Button */}
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;