import { forwardRef } from 'react';

// Ícone de búfalo
const BuffaloIcon = forwardRef(function BuffaloIcon({ size = 24, strokeWidth = 2, className, ...props }, ref) {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* chifres */}
      <path d="M8.2 8.2C5.4 8.8 3.4 7.4 2.8 4" />
      <path d="M15.8 8.2c2.8.6 4.8-.8 5.4-4.2" />
      {/* orelhas */}
      <path d="M7.6 11.2C6.2 10.6 4.6 11 3.6 12.2c1.2 1.4 2.8 1.6 4 .8" />
      <path d="M16.4 11.2c1.4-.6 3-.2 4 1-1.2 1.4-2.8 1.6-4 .8" />
      {/* cabeça e focinho */}
      <path d="M8.2 7.6C9.4 7 10.6 6.8 12 6.8s2.6.2 3.8.8l.4 6.2c.1 3.4-1.7 6.4-4.2 6.4s-4.3-3-4.2-6.4z" />
      {/* olhos e narinas */}
      <path d="M9.8 11.6h.01M14.2 11.6h.01" />
      <path d="M10.4 17.4h.01M13.6 17.4h.01" />
    </svg>
  );
});

export default BuffaloIcon;