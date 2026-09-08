import React from 'react';

/**
 * Clickable Suggestion Chips Bar for Buyer AI Chatbot
 * 
 * @param {Object} props
 * @param {string[]} props.suggestions - List of suggestion phrases
 * @param {function} props.onSelect - Callback when chip is clicked
 * @param {boolean} [props.disabled=false] - Whether buttons are disabled
 */
export const BuyerAISuggestions = ({ suggestions = [], onSelect, disabled = false }) => {
  if (!Array.isArray(suggestions) || suggestions.length === 0) return null;

  return (
    <div className="buyer-ai-chips-bar" role="toolbar" aria-label="Suggested search queries">
      {suggestions.map((suggestion, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onSelect(suggestion)}
          disabled={disabled}
          className="buyer-ai-chip"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

export default BuyerAISuggestions;
