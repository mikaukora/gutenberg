import { useCallback, useEffect, useState } from 'react';
import { fetchBooks, type Book } from './api';
import { languageToLabel } from './utils/language';
import { BookTable } from './components/BookTable';
import { LanguageFilter } from './components/LanguageFilter';
import { Pagination } from './components/Pagination';
import { SearchBar } from './components/SearchBar';
import './App.css';

const PAGE_SIZE = 50;

function App() {
  const [language, setLanguage] = useState('fi');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    fetchBooks({ language, search, page, limit: PAGE_SIZE, signal: controller.signal })
      .then((res) => {
        if (cancelled) return;
        setLoading(true);
        setBooks(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
        setRefreshedAt(res.refreshedAt);
      })
      .catch((error) => {
        if (cancelled || error.name === 'AbortError') return;
        console.error(error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [language, search, page]);

  const handleLanguageChange = useCallback((lang: string) => {
    setLanguage(lang);
    setPage(1);
  }, []);

  const handleSearch = useCallback((term: string) => {
    setSearch(term);
    setPage(1);
  }, []);

  const handleSearchByAuthor = useCallback((author: string) => {
    setSearch(author);
    setPage(1);
  }, []);

  const handleSearchByCategory = useCallback((category: string) => {
    setSearch(category);
    setPage(1);
  }, []);

  const languageLabel = language ? languageToLabel(language) : null;
  const subtitle =
    search && language
      ? `"${search}" in ${languageLabel ?? language} — ${total.toLocaleString()} books`
      : language
        ? `Recent ${languageLabel ?? language} books — ${total.toLocaleString()} in catalog`
        : `${total.toLocaleString()} books from Project Gutenberg`;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Project Gutenberg Catalog</h1>
        <p className="subtitle">
          {subtitle}
          {refreshedAt && (
            <>
              {' · '}
              <span>
                Data updated{' '}
                {new Date(refreshedAt).toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </>
          )}
        </p>
      </header>

      <div className="controls">
        <LanguageFilter value={language} onChange={handleLanguageChange} />
        <SearchBar value={search} onSearch={handleSearch} />
      </div>

      <BookTable
        books={books}
        loading={loading}
        onSearchByAuthor={handleSearchByAuthor}
        onSearchByCategory={handleSearchByCategory}
      />

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
