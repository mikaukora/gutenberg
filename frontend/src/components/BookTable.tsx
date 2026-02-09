import type { Book } from '../api';
import { formatLanguageDisplay } from '../utils/language';

interface Props {
  books: Book[];
  loading: boolean;
  onSearchByAuthor?: (author: string) => void;
  onSearchByCategory?: (category: string) => void;
}

function AuthorCell({
  authors,
  onSearchByAuthor,
}: {
  authors: string;
  onSearchByAuthor?: (author: string) => void;
}) {
  if (!onSearchByAuthor || !authors) return <>{authors}</>;
  // Authors are typically separated by ';'. Keep commas within a single
  // author entry so values like "Tolstoy, Leo, graf." remain one clickable name.
  const names = authors
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  return (
    <>
      {names.map((name, i) => (
        <span key={i}>
          {i > 0 && ', '}
          <button
            type="button"
            className="author-link"
            onClick={() => onSearchByAuthor(name)}
            title={`Show all titles by ${name}`}
          >
            {name}
          </button>
        </span>
      ))}
    </>
  );
}

function normalizeCategories(raw: string): string[] {
  if (!raw) return [];
  const result: string[] = [];
  const blocks = raw.split(';');
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    const withoutPrefix = trimmed.replace(/^Category:\s*/i, '').trim();
    if (!withoutPrefix) continue;
    const parts = withoutPrefix.split(',').map((p) => p.trim()).filter(Boolean);
    result.push(...parts);
  }
  return Array.from(new Set(result));
}

function CategoryCell({
  categories,
  onSearchByCategory,
}: {
  categories: string;
  onSearchByCategory?: (category: string) => void;
}) {
  const items = normalizeCategories(categories);
  if (!items.length) return null;

  if (!onSearchByCategory) {
    return <>{items.join(', ')}</>;
  }

  return (
    <>
      {items.map((name, i) => (
        <span key={name}>
          {i > 0 && ', '}
          <button
            type="button"
            className="category-link"
            onClick={() => onSearchByCategory(name)}
            title={`Show all titles with category ${name}`}
          >
            {name}
          </button>
        </span>
      ))}
    </>
  );
}

export function BookTable({
  books,
  loading,
  onSearchByAuthor,
  onSearchByCategory,
}: Props) {
  return (
    <div className="table-wrapper">
      <table className="book-table">
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Authors</th>
            <th scope="col">Issued</th>
            <th scope="col">Language</th>
            <th scope="col">Category</th>
            <th scope="col">Subjects</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="skeleton-row">
                  <td colSpan={6}>
                    <div className="skeleton-line skeleton-line-wide" />
                  </td>
                </tr>
              ))
            : books.length === 0
              ? (
                <tr>
                  <td colSpan={6}>
                    <div className="no-results">
                      <p>No books found.</p>
                      <p className="no-results-hint">
                        Try a broader search term or clear filters.
                      </p>
                    </div>
                  </td>
                </tr>
                )
              : books.map((book) => (
                  <tr key={book.textId}>
                    <td>
                      <a
                        href={`https://www.gutenberg.org/ebooks/${book.textId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {book.title}
                      </a>
                    </td>
                    <td className="authors-cell">
                      <AuthorCell
                        authors={book.authors}
                        onSearchByAuthor={onSearchByAuthor}
                      />
                    </td>
                    <td className="date-cell">{book.issued}</td>
                    <td className="lang-cell">
                      {formatLanguageDisplay(book.language)}
                    </td>
                    <td className="category-cell" title={book.categories}>
                      <CategoryCell
                        categories={book.categories}
                        onSearchByCategory={onSearchByCategory}
                      />
                    </td>
                    <td className="subjects-cell" title={book.subjects}>
                      {book.subjects}
                    </td>
                  </tr>
                ))}
        </tbody>
      </table>
    </div>
  );
}
