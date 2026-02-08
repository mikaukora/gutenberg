import type { Book } from '../api';

interface Props {
  books: Book[];
  loading: boolean;
}

export function BookTable({ books, loading }: Props) {
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (books.length === 0) {
    return <div className="no-results">No books found.</div>;
  }

  return (
    <div className="table-wrapper">
      <table className="book-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Authors</th>
            <th>Issued</th>
            <th>Language</th>
            <th>Subjects</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
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
              <td>{book.authors}</td>
              <td className="date-cell">{book.issued}</td>
              <td className="lang-cell">{book.language}</td>
              <td className="subjects-cell">{book.subjects}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
