import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500
        ${isDark ? 'bg-gray-700' : 'bg-gray-200'}
      `}
      role="switch"
      aria-checked={isDark}
    >
      <span className="sr-only">Toggle theme</span>
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
          ${isDark ? 'translate-x-5' : 'translate-x-0'}
          flex items-center justify-center
        `}
      >
        {isDark ? (
          <Moon size={12} className="text-gray-700" />
        ) : (
          <Sun size={12} className="text-yellow-500" />
        )}
      </span>
    </button>
  );
}
