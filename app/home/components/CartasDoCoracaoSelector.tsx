'use client';
import React from 'react';

// Definindo a interface para o objeto da carta
interface Carta {
  id: string;
  titulo: string;
  conteudo: string;
}

interface Props {
  cartas: Carta[];
  selectedId: string; // Mudamos para ID para ser mais preciso
  onSelect: (carta: Carta) => void;
}

export default function CartasDoCoracaoSelector({ cartas, selectedId, onSelect }: Props) {
  return (
    <div className="bg-red-50 p-4 rounded-lg shadow-inner mt-2 space-y-3">
      <h2 className="font-semibold text-gray-800 border-b border-red-200 pb-2">
        Escolha uma Carta do Coração
      </h2>
      
      <div className="flex flex-col gap-2">
        {cartas.map((carta) => {
          const isSelected = selectedId === carta.id;
          
          return (
            <div 
              key={carta.id} 
              className={`border rounded-md transition-all ${
                isSelected ? 'border-red-400 bg-white shadow-sm' : 'border-transparent'
              }`}
            >
              <button
                onClick={() => onSelect(carta)}
                className={`w-full text-left p-3 rounded flex justify-between items-center hover:bg-red-100 transition ${
                  isSelected ? 'font-bold text-red-700' : 'text-gray-700'
                }`}
              >
                <span>{carta.titulo}</span>
                <span>{isSelected ? '▼' : '▶'}</span>
              </button>

              {/* Conteúdo que aparece quando tica/seleciona */}
              {isSelected && (
                <div className="p-3 pt-0 text-sm text-gray-600 animate-in fade-in zoom-in-95 duration-200">
                  <p className="italic">{carta.conteudo}</p>
                  <div className="mt-2 text-xs text-red-400 font-medium">
                    Carta selecionada para sua mensagem
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}