import type { Book } from '../api';
import { formatLanguageDisplay } from '../utils/language';

interface Props {
  books: Book[];
  loading: boolean;
  onSearchByAuthor?: (author: string) => void;
}

function AuthorCell({
  authors,
  onSearchByAuthor,
}: {
  authors: string;
  onSearchByAuthor?: (author: string) => void;
}) {
  if (!onSearchByAuthor || !authors) return <>{authors}</>;
  const names = authors.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
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

export function BookTable({ books, loading, onSearchByAuthor }: Props) {
  return (
    <div className="table-wrapper">
      <table className="book-table">
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Authors</th>
            <th scope="col">Issued</th>
            <th scope="col">Language</th>
            <th scope="col">Subjects</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="skeleton-row">
                  <td colSpan={5}>
                    <div className="skeleton-line skeleton-line-wide" />
                  </td>
                </tr>
              ))
            : books.length === 0
              ? (
                <tr>
                  <td colSpan={5}>
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
                    <td className="subjects-cell">{book.subjects}</td>
                  </tr>
                ))}
        </tbody>
      </table>
    </div>
  );
}
