import { useEffect, useState } from 'react';
import { fetchLanguages } from '../api';

interface Props {
  value: string;
  onChange: (language: string) => void;
}

export function LanguageFilter({ value, onChange }: Props) {
  const [languages, setLanguages] = useState<string[]>([]);

  useEffect(() => {
    fetchLanguages().then(setLanguages).catch(console.error);
  }, []);

  return (
    <select
      className="language-filter"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">All languages</option>
      {languages.map((lang) => (
        <option key={lang} value={lang}>
          {lang}
        </option>
      ))}
    </select>
  );
}
