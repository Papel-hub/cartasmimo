'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {

  const [scrollY, setScrollY] = useState(0);

  // Adiciona sombra ao rolar
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`bg-red-900 text-white fixed top-0 w-full z-50 transition-all duration-300 ${
        scrollY > 10 ? 'shadow-lg' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/home" style={{ width: '120px' }}>
            <Image

              src="/images/logopc1.svg"
              alt="Mimo Meu e Seu"
              width={120}
              height={50}
              priority
              style={{ height: 'auto', width: 'auto' }}
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
