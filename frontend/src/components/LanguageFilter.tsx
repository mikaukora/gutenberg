import { useEffect, useState } from 'react';
import { fetchLanguages } from '../api';
import { formatLanguageDisplay } from '../utils/language';

const PREFERRED = [
  { code: 'fi', label: 'Finnish' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'French' },
  { code: 'sv', label: 'Swedish' },
] as const;

interface Props {
  value: string;
  onChange: (language: string) => void;
}

export function LanguageFilter({ value, onChange }: Props) {
  const [allLanguages, setAllLanguages] = useState<string[]>([]);

  useEffect(() => {
    fetchLanguages().then(setAllLanguages).catch(console.error);
  }, []);

  const preferredCodeSet = new Set<string>(PREFERRED.map((p) => p.code));
  const preferred = PREFERRED.filter((p) => allLanguages.includes(p.code));
  const other = allLanguages.filter((lang) => !preferredCodeSet.has(lang));

  return (
    <div className="language-filter" role="group" aria-label="Language">
      <span className="language-filter-label">Language</span>
      <div className="language-filter-options">
        <button
          type="button"
          className={`language-chip ${value === '' ? 'active' : ''}`}
          onClick={() => onChange('')}
        >
          All
        </button>
        {preferred.map(({ code, label }) => (
          <button
            type="button"
            key={code}
            className={`language-chip ${value === code ? 'active' : ''}`}
            onClick={() => onChange(code)}
          >
            {label}
          </button>
        ))}
        {other.length > 0 && (
          <select
            className="language-select-other"
            value={value && other.includes(value) ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Other languages"
            title="Other languages"
          >
            <option value="">Other…</option>
            {other.map((lang) => (
              <option key={lang} value={lang}>
                {formatLanguageDisplay(lang)}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
