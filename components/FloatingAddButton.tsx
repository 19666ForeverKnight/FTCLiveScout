'use client';

import { useState } from 'react';
import Link from 'next/link';

export function FloatingAddButton() {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    {
      name: 'Match Scout',
      href: '/match-scout',
      icon: '🎯',
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'Record match data',
    },
    {
      name: 'Pit Scout',
      href: '/pit-scout',
      icon: '🔧',
      color: 'bg-green-600 hover:bg-green-700',
      description: 'Document robot specs',
    },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Options Menu */}
      {isOpen && (
        <div className="fixed bottom-36 lg:bottom-24 right-4 lg:right-8 z-50 space-y-3">
          {options.map((option, index) => (
            <Link
              key={option.href}
              href={option.href}
              className={`flex items-center ${option.color} text-white rounded-full shadow-lg pr-4 pl-3 py-3 transform transition-all duration-200 hover:scale-105 touch-manipulation animate-slide-up`}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
              onClick={() => setIsOpen(false)}
            >
              <span className="text-2xl mr-3 bg-white/20 rounded-full w-10 h-10 flex items-center justify-center">
                {option.icon}
              </span>
              <div className="text-left">
                <div className="font-semibold text-sm">{option.name}</div>
                <div className="text-xs opacity-90">{option.description}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 lg:bottom-8 right-4 lg:right-8 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 touch-manipulation ${
          isOpen
            ? 'bg-red-600 hover:bg-red-700 rotate-45'
            : 'bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700'
        }`}
        aria-label="Add scout report"
      >
        <svg
          className="w-7 h-7 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      </button>

    </>
  );
}
