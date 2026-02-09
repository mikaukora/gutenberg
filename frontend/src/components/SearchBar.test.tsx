import { fireEvent, render, screen } from '@testing-library/react';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('calls onSearch when cleared with the clear button and keeps focus on the input', () => {
    const onSearch = vi.fn();
    render(<SearchBar value="Tolstoy" onSearch={onSearch} />);

    const input = screen.getByRole('textbox', {
      name: /search by title, author, subject, or category/i,
    });

    // ensure input has initial value
    expect((input as HTMLInputElement).value).toBe('Tolstoy');

    const clearButton = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(clearButton);

    expect(onSearch).toHaveBeenCalledWith('');
    expect(document.activeElement).toBe(input);
  });
});

