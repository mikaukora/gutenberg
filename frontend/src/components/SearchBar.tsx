import { useEffect, useRef, useState } from 'react';

interface Props {
  onSearch: (term: string) => void;
}

export function SearchBar({ onSearch }: Props) {
  const [input, setInput] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(input);
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [input, onSearch]);

  return (
    <input
      className="search-bar"
      type="text"
      placeholder="Search titles, authors, subjects..."
      value={input}
      onChange={(e) => setInput(e.target.value)}
    />
  );
}
