const CODE_TO_LABEL: Record<string, string> = {
  fi: 'Finnish',
  en: 'English',
  fr: 'French',
  sv: 'Swedish',
};

export function formatLanguageDisplay(value: string): string {
  if (!value) return value;
  const parts = value.split(/[;,]|\s+/).map((p) => p.trim()).filter(Boolean);
  if (parts.length > 1) {
    return parts.map((c) => CODE_TO_LABEL[c] ?? c).join('; ');
  }
  return CODE_TO_LABEL[value] ?? value;
}

export function languageToLabel(code: string): string {
  if (!code) return '';
  const parts = code.split(/[;,]|\s+/).map((c) => c.trim()).filter(Boolean);
  if (parts.length > 1) {
    return parts.map((c) => CODE_TO_LABEL[c] ?? c).join('; ');
  }
  return CODE_TO_LABEL[code] ?? code;
}
