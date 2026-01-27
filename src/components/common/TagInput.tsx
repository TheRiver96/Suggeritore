import { useState, useRef, useEffect, useCallback } from 'react';
import { TagIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  existingTags?: string[]; // Tag esistenti per autocomplete
  placeholder?: string;
  label?: string;
}

export function TagInput({
  tags,
  onTagsChange,
  existingTags = [],
  placeholder = 'Aggiungi tag...',
  label = 'Tag',
}: TagInputProps) {
  const [tagInput, setTagInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filtra suggerimenti in base all'input
  const filteredSuggestions = existingTags.filter(
    (tag) =>
      tag.toLowerCase().includes(tagInput.toLowerCase()) &&
      !tags.includes(tag) &&
      tagInput.trim().length > 0
  );

  // Chiudi suggerimenti quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlight quando cambia la lista dei suggerimenti
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredSuggestions.length]);

  const handleAddTag = useCallback((tagToAdd?: string) => {
    const trimmedTag = (tagToAdd || tagInput).trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag]);
      setTagInput('');
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  }, [tagInput, tags, onTagsChange]);

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
        handleAddTag(filteredSuggestions[highlightedIndex]);
      } else {
        handleAddTag();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        setShowSuggestions(true);
        setHighlightedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        setShowSuggestions(true);
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleAddTag(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={tagInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => tagInput.trim() && setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teatro-500"
            aria-label={label}
            aria-autocomplete="list"
            aria-expanded={showSuggestions && filteredSuggestions.length > 0}
            aria-controls="tag-suggestions"
          />

          {/* Dropdown suggerimenti */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              id="tag-suggestions"
              role="listbox"
              className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
            >
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  role="option"
                  aria-selected={index === highlightedIndex}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors duration-100
                    ${
                      index === highlightedIndex
                        ? 'bg-teatro-100 text-teatro-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <TagIcon className="w-4 h-4 text-gray-400" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => handleAddTag()}
          disabled={!tagInput.trim()}
          className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition-colors duration-150"
          aria-label="Aggiungi tag"
        >
          <TagIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Tag aggiunti */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2" role="list" aria-label="Tag aggiunti">
          {tags.map((tag) => (
            <span
              key={tag}
              role="listitem"
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full transition-colors duration-150 hover:bg-gray-200 animate-scaleIn"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-red-600 transition-colors duration-150"
                aria-label={`Rimuovi tag ${tag}`}
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
