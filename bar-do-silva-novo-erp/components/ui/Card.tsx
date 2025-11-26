import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, action }) => {
  return (
    <div className={`bg-white dark:bg-[#121212] border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm dark:shadow-lg dark:shadow-black/40 overflow-hidden transition-colors duration-300 ${className}`}>
      {(title || action) && (
        <div className="px-6 py-5 border-b border-gray-100 dark:border-zinc-800/50 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/30">
          {title && <h3 className="font-semibold text-gray-800 dark:text-zinc-100 tracking-tight text-lg">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};