import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: 'Fiction',
    rating: 0
  });
  const [bookFile, setBookFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const categories = ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Romance', 'Mystery', 'Fantasy', 'Other'];

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setBookFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      if (editingBook) {
        // Update book
        await axios.put(`http://localhost:5000/api/admin/books/${editingBook._id}`, formData);
        alert('Book updated successfully!');
      } else {
        // Add new book
        if (!bookFile) {
          alert('Please select a book file');
          setSubmitLoading(false);
          return;
        }

        const formDataWithFile = new FormData();
        Object.keys(formData).forEach(key => {
          formDataWithFile.append(key, formData[key]);
        });
        formDataWithFile.append('bookFile', bookFile);

        await axios.post('http://localhost:5000/api/admin/books', formDataWithFile, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Book added successfully!');
      }

      // Reset form and refresh books
      setFormData({
        title: '',
        author: '',
        description: '',
        category: 'Fiction',
        rating: 0
      });
      setBookFile(null);
      setShowAddForm(false);
      setEditingBook(null);
      fetchBooks();
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Error saving book: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      category: book.category,
      rating: book.rating
    });
    setShowAddForm(true);
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/admin/books/${bookId}`);
      alert('Book deleted successfully!');
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Error deleting book: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      description: '',
      category: 'Fiction',
      rating: 0
    });
    setBookFile(null);
    setShowAddForm(false);
    setEditingBook(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
        >
          Add New Book
        </button>
      </div>

      {/* Add/Edit Book Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-full overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingBook ? 'Edit Book' : 'Add New Book'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">Author</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-input"
                  rows="4"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Rating</label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="form-input"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
              </div>

              {!editingBook && (
                <div>
                  <label className="form-label">Book File (PDF or ePub)</label>
                  <input
                    type="file"
                    accept=".pdf,.epub"
                    onChange={handleFileChange}
                    className="form-input"
                    required
                  />
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="btn-primary disabled:opacity-50"
                >
                  {submitLoading ? 'Saving...' : (editingBook ? 'Update Book' : 'Add Book')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Books Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Book
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Downloads
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {books.map((book) => (
              <tr key={book._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{book.title}</div>
                    <div className="text-sm text-gray-500">by {book.author}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                    {book.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ⭐ {book.rating}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {book.downloadCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(book)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(book._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {books.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No books found. Add your first book!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;