import { useEffect, useRef, useState } from 'react';

interface Props {
  value: string;
  onSearch: (term: string) => void;
}

export function SearchBar({ value, onSearch }: Props) {
  const [input, setInput] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setInput(value);
  }, [value]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(input);
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [input, onSearch]);

  return (
    <div className="search-bar-wrap">
      <span className="search-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" fill="none" />
          <line
            x1="15.5"
            y1="15.5"
            x2="20"
            y2="20"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <input
        ref={inputRef}
        className="search-bar"
        type="text"
        placeholder="Search by title or author"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        aria-label="Search by title or author"
      />
      {input && (
        <button
          type="button"
          className="search-clear"
          onClick={() => {
            setInput('');
            onSearch('');
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}
