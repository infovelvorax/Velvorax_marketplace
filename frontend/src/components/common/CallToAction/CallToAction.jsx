import './CallToAction.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../Button';

export const CallToAction = ({
  title,
  highlight,
  description,
  buttonText = 'Get Started',
  buttonLink = '/contact'
}) => {
  return (
    <div className="bg-[var(--bg-surface)] border-y border-[var(--border-primary)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:flex lg:items-center lg:justify-between lg:py-16 lg:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl">
          <span className="block">{title}</span>
          {highlight && <span className="block text-[var(--accent)] mt-1">{highlight}</span>}
          {description && (
            <span className="block text-[var(--text-secondary)] text-lg sm:text-xl mt-4 font-normal">{description}</span>
          )}
        </h2>
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div className="inline-flex rounded-md">
            <Button as={Link} to={buttonLink} size="lg" variant="primary">
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallToAction;
