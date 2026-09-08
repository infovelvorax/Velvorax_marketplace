import React from 'react';
import { BuyerAIResultCard } from './BuyerAIResultCard';

/**
 * Format markdown bold text, bullet points, and headers safely
 */
function renderFormattedText(text = '') {
  if (!text) return null;

  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    // Bullet point check
    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('* ');
    const cleanedLine = isBullet ? line.replace(/^[\s•*-]+/, '').trim() : line;

    // Parse bold **text**
    const parts = cleanedLine.split(/(\*\*.*?\*\*)/g);
    const formattedParts = parts.map((part, partIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    if (isBullet) {
      return (
        <li key={lineIdx} className="buyer-ai-bullet-item">
          {formattedParts}
        </li>
      );
    }

    if (line.trim().startsWith('###')) {
      return (
        <h5 key={lineIdx} className="buyer-ai-section-heading">
          {line.replace(/^###\s*/, '')}
        </h5>
      );
    }

    if (!line.trim()) {
      return <div key={lineIdx} className="buyer-ai-line-spacer" />;
    }

    return (
      <p key={lineIdx} className="buyer-ai-paragraph">
        {formattedParts}
      </p>
    );
  });
}

/**
 * Single Message Row Component (User or Assistant)
 * 
 * @param {Object} props
 * @param {Object} props.message - Message payload
 * @param {function} [props.onSelectListing] - Callback when user clicks a listing card link
 */
export const BuyerAIMessage = ({ message, onSelectListing }) => {
  if (!message) return null;

  const isAssistant = message.sender === 'assistant';
  const listingCards = Array.isArray(message.listingCards) ? message.listingCards : [];

  return (
    <div className={`buyer-ai-msg-row ${isAssistant ? 'msg-assistant' : 'msg-user'}`}>
      {isAssistant && (
        <div className="buyer-ai-msg-avatar" aria-hidden="true">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
      )}

      <div className="buyer-ai-bubble-wrap">
        <div className="buyer-ai-bubble">
          {renderFormattedText(message.message)}
        </div>

        {/* Real Listing Cards Carousel */}
        {isAssistant && listingCards.length > 0 && (
          <div className="buyer-ai-listings-carousel" role="region" aria-label="Marketplace listings">
            {listingCards.map((item) => (
              <BuyerAIResultCard
                key={item.id || item._id}
                item={item}
                onSelect={onSelectListing}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerAIMessage;
