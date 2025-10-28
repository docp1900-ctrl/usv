import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-base-100 rounded-lg shadow-md p-6 ${className}`}>
      {title && <h2 className="text-xl font-bold mb-4 text-neutral">{title}</h2>}
      {children}
    </div>
  );
};

export default Card;
