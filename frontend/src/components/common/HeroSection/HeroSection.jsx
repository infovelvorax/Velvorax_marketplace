import './HeroSection.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../Button';

export const HeroSection = ({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  image,
  align = 'left' // 'left' | 'center'
}) => {
  return (
    <section className="relative overflow-hidden bg-[var(--bg-primary)] py-16 sm:py-24 lg:py-32">
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${align === 'center' ? 'text-center' : ''}`}>
        <div className={`lg:grid lg:grid-cols-12 lg:gap-8 ${align === 'center' ? 'flex flex-col items-center' : ''}`}>
          <div className={`sm:text-center md:mx-auto lg:col-span-6 lg:text-left ${align === 'center' ? 'lg:col-span-12 lg:text-center' : ''}`}>
            {subtitle && (
              <span className="block text-sm font-semibold uppercase tracking-wide text-[var(--accent)] sm:text-base lg:text-sm xl:text-base">
                {subtitle}
              </span>
            )}
            <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            {description && (
              <p className="mt-3 text-base text-[var(--text-secondary)] sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                {description}
              </p>
            )}
            <div className={`mt-8 sm:max-w-lg sm:mx-auto lg:mx-0 sm:flex sm:justify-center lg:justify-start ${align === 'center' ? 'lg:mx-auto lg:justify-center' : ''}`}>
              {primaryAction && (
                <div className="mt-3 sm:mt-0 sm:mr-3">
                  <Button as={Link} to={primaryAction.to} size="lg" className="w-full sm:w-auto">
                    {primaryAction.label}
                  </Button>
                </div>
              )}
              {secondaryAction && (
                <div className="mt-3 sm:mt-0">
                  <Button as={Link} to={secondaryAction.to} variant="outline" size="lg" className="w-full sm:w-auto">
                    {secondaryAction.label}
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {image && align === 'left' && (
            <div className="relative mt-12 sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-2xl shadow-lg lg:max-w-md overflow-hidden border border-[var(--border-primary)]">
                <img
                  className="w-full object-cover"
                  src={image}
                  alt={title}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
