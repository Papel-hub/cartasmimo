'use client';
import React from 'react';

interface Props {
  cartas: string[];
  selected: string;
  onSelect: (frase: string) => void;
}

export default function CartasDoCoracaoSelector({ cartas, selected, onSelect }: Props) {
  return (
    <div className="bg-red-50 p-4 rounded-lg shadow-inner mt-2 space-y-2">
      <h2 className="font-semibold text-gray-800">Escolha uma Carta do Coração</h2>
      {cartas.map((frase, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(frase)}
          className={`w-full text-left p-2 rounded hover:bg-red-100 transition ${
            selected === frase ? 'bg-red-200 font-semibold' : ''
          }`}
        >
          {frase}
        </button>
      ))}
    </div>
  );
}
