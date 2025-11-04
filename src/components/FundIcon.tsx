import React from 'react';

type Props = {
  src?: string;
  className?: string;
  size?: number;
  alt?: string;
};

export function FundIcon({ src, className = '', size = 28, alt = 'icono fondo' }: Props) {
  const finalSrc = src || '/favicon.svg';
  return (
    <img
      src={finalSrc}
      alt={alt}
      width={size}
      height={size}
      className={`object-contain ${className}`}
    />
  );
}
