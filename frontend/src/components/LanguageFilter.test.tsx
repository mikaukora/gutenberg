/**
 * LanguageFilter tests. Mock API returns string[] (language codes like "fi", "fi; sv").
 * The test script runs `tsc -b` before vitest, so type errors in the component
 * (e.g. using Set without Set<string> when filtering string[]) are caught before tests run.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageFilter } from './LanguageFilter';
import * as api from '../api';

vi.mock('../api');

describe('LanguageFilter', () => {
  beforeEach(() => {
    vi.mocked(api.fetchLanguages).mockReset();
  });

  it('shows preferred languages as chips when API returns code-formatted list', async () => {
    // API contract: fetchLanguages() returns string[] (e.g. "fi", "fi; sv"). Using string[]
    // here ensures tsc type-checks component code that filters this list (e.g. Set<string>).
    const languagesFromApi: string[] = ['fi', 'en', 'fr', 'sv', 'de', 'fi; sv'];
    vi.mocked(api.fetchLanguages).mockResolvedValue(languagesFromApi);

    render(<LanguageFilter value="" onChange={vi.fn()} />);

    await screen.findByRole('button', { name: 'Finnish' });
    expect(screen.getByRole('button', { name: 'English' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'French' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Swedish' })).toBeTruthy();

    const allChip = screen.getByRole('button', { name: 'All' });
    expect(allChip.className).toContain('active');
  });

  it('shows Other dropdown and calls onChange when selecting another language', async () => {
    const languagesFromApi: string[] = ['fi', 'en', 'de', 'fi; sv'];
    vi.mocked(api.fetchLanguages).mockResolvedValue(languagesFromApi);

    const onChange = vi.fn();
    render(<LanguageFilter value="" onChange={onChange} />);

    const otherSelect = await screen.findByRole('combobox', {
      name: /other languages/i,
    });
    fireEvent.change(otherSelect, { target: { value: 'de' } });
    expect(onChange).toHaveBeenCalledWith('de');
  });

  it('calls onChange with language code when preferred chip is clicked', async () => {
    const languagesFromApi: string[] = ['fi', 'en'];
    vi.mocked(api.fetchLanguages).mockResolvedValue(languagesFromApi);

    const onChange = vi.fn();
    render(<LanguageFilter value="" onChange={onChange} />);

    await vi.waitFor(() => {
      expect(screen.getByRole('button', { name: 'Finnish' })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Finnish' }));
    expect(onChange).toHaveBeenCalledWith('fi');
  });

  it('marks selected language chip as active', async () => {
    const languagesFromApi: string[] = ['fi', 'en'];
    vi.mocked(api.fetchLanguages).mockResolvedValue(languagesFromApi);

    render(<LanguageFilter value="fi" onChange={vi.fn()} />);

    await vi.waitFor(() => {
      expect(screen.getByRole('button', { name: 'Finnish' })).toBeTruthy();
    });

    const finnishChip = screen.getByRole('button', { name: 'Finnish' });
    expect(finnishChip.className).toContain('active');
  });
});
