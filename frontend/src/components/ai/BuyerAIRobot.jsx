import React from 'react';
import './FloatingRobotButton.css';

/**
 * Buyer AI Animated Floating Robot Trigger Component
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether chatbot is open
 * @param {function} props.onClick - Toggle handler
 * @param {boolean} [props.isThinking=false] - Whether AI is processing/searching
 * @param {number} [props.unreadCount=0] - Unread counter
 * @param {string} [props.tooltip="Buyer AI"] - Tooltip text
 */
export const BuyerAIRobot = ({
  isOpen,
  onClick,
  isThinking = false,
  unreadCount = 0,
  tooltip = 'Buyer AI'
}) => {
  return (
    <div className="velvorax-robot-trigger-wrapper robot-theme-buyer">
      <button
        id="buyer-ai-robot-btn"
        className={`velvorax-robot-btn ${isOpen ? 'is-open' : ''} ${isThinking ? 'is-thinking' : ''}`}
        onClick={onClick}
        aria-label={isOpen ? 'Close Buyer AI Assistant' : tooltip}
        title={isOpen ? 'Close Buyer AI Assistant' : tooltip}
        type="button"
      >
        {isOpen ? (
          <div className="robot-close-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
        ) : (
          <div className="robot-avatar-container">
            <svg
              className="robot-svg"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Antenna */}
              <line x1="32" y1="6" x2="32" y2="16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <circle className="robot-antenna-bulb" cx="32" cy="6" r="4" fill="currentColor" />

              {/* Ears / Head Bolts */}
              <rect x="6" y="24" width="6" height="12" rx="3" fill="currentColor" opacity="0.8" />
              <rect x="52" y="24" width="6" height="12" rx="3" fill="currentColor" opacity="0.8" />

              {/* Head Shell */}
              <rect
                x="12"
                y="16"
                width="40"
                height="32"
                rx="10"
                className="robot-head-shell"
                stroke="currentColor"
                strokeWidth="2.5"
              />

              {/* Eye Visor Screen */}
              <rect
                x="18"
                y="22"
                width="28"
                height="14"
                rx="5"
                className="robot-visor"
              />

              {/* Animated Glowing Eyes */}
              <circle className="robot-eye robot-eye-left" cx="25" cy="29" r="3.2" />
              <circle className="robot-eye robot-eye-right" cx="39" cy="29" r="3.2" />

              {/* Cheerful Mouth */}
              <line x1="26" y1="41" x2="38" y2="41" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

              {/* Collar / Body Base */}
              <path
                d="M22 48L18 56C18 58 20 59 22 59H42C44 59 46 58 46 56L42 48H22Z"
                className="robot-neck-base"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>

            {/* Role Badge Indicator */}
            <span className="robot-role-tag">Buyer AI</span>
          </div>
        )}

        {/* Unread Alert Dot */}
        {!isOpen && unreadCount > 0 && (
          <span className="robot-unread-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* Thinking Ripple Rings */}
        {isThinking && <div className="robot-pulse-ring" />}
      </button>

      {/* Floating Hover Tooltip */}
      {!isOpen && (
        <div className="robot-hover-tooltip" role="tooltip">
          <span>{tooltip}</span>
        </div>
      )}
    </div>
  );
};

export default BuyerAIRobot;
