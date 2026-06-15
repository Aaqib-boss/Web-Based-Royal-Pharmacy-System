import React from 'react';

const Logo = ({ variant = 'horizontal', iconSize = 'md', lightText = false }) => {
  // Get height classes for the logo image
  const getLogoHeight = () => {
    if (variant === 'vertical') {
      switch (iconSize) {
        case 'sm': return 'h-12';
        case 'md': return 'h-20';
        case 'lg': return 'h-32';
        case 'xl': return 'h-40';
        default: return 'h-24';
      }
    } else {
      switch (iconSize) {
        case 'sm': return 'h-10';
        case 'md': return 'h-14';
        case 'lg': return 'h-18';
        case 'xl': return 'h-24';
        default: return 'h-14';
      }
    }
  };

  if (lightText) {
    return (
      <div className="select-none flex items-center justify-center">
        <img
          src="/royal_logo_white.png?v=3"
          alt="Royal Logo"
          className={`${getLogoHeight()} w-auto object-contain transition-all duration-300`}
        />
      </div>
    );
  }

  return (
    <div className="select-none flex items-center justify-center">
      {/* Light Mode Logo (Navy & Gold, Transparent) */}
      <img
        src="/royal_logo.png?v=3"
        alt="Royal Logo"
        className={`${getLogoHeight()} w-auto object-contain transition-all duration-300 dark:hidden`}
      />
      {/* Dark Mode Logo (White & Gold, Transparent) */}
      <img
        src="/royal_logo_white.png?v=3"
        alt="Royal Logo"
        className={`${getLogoHeight()} w-auto object-contain transition-all duration-300 hidden dark:block`}
      />
    </div>
  );
};

export default Logo;
