import { useEffect, useRef, useState } from 'react';

interface Props {
  value: string;
  onSearch: (term: string) => void;
}

export function SearchBar({ value, onSearch }: Props) {
  const [input, setInput] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
      <input
        className="search-bar"
        type="text"
        placeholder="Search by title or author"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        aria-label="Search by title or author"
      />
    </div>
  );
}
