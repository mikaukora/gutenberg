import { useCallback, useEffect, useState } from 'react';
import { fetchBooks, type Book } from './api';
import { BookTable } from './components/BookTable';
import { LanguageFilter } from './components/LanguageFilter';
import { Pagination } from './components/Pagination';
import { SearchBar } from './components/SearchBar';
import './App.css';

const PAGE_SIZE = 50;

function App() {
  const [language, setLanguage] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchBooks({ language, search, page, limit: PAGE_SIZE })
      .then((res) => {
        setBooks(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [language, search, page]);

  const handleLanguageChange = useCallback((lang: string) => {
    setLanguage(lang);
    setPage(1);
  }, []);

  const handleSearch = useCallback((term: string) => {
    setSearch(term);
    setPage(1);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Project Gutenberg Catalog</h1>
        <p className="subtitle">
          Browse {total.toLocaleString()} books from Project Gutenberg
        </p>
      </header>

      <div className="controls">
        <LanguageFilter value={language} onChange={handleLanguageChange} />
        <SearchBar onSearch={handleSearch} />
      </div>

      <BookTable books={books} loading={loading} />

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
}

export default App;
