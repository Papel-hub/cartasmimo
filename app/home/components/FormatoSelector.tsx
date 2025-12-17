'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// Tipos das opções
export type FormatoTipo =
  | 'digital'
  | 'fisico'
  | 'digital_audio'
  | 'digital_video'
  | 'digital_fisico_audio'
  | 'full_premium';

// Fallback seguro
const DEFAULT_PRECOS: Record<FormatoTipo, number> = {
  digital: 79,
  fisico: 129,
  digital_audio: 149,
  digital_video: 179,
  digital_fisico_audio: 249,
  full_premium: 319,
};

const LABELS: Record<FormatoTipo, string> = {
  digital: 'Cartão digital',
  fisico: 'Cartão físico',
  digital_audio: 'Digital + Áudio',
  digital_video: 'Digital + Vídeo',
  digital_fisico_audio: 'Digital e Físico + Áudio',
  full_premium: 'Físico + Digital + Áudio + Vídeo',
};

type FormatoSelectorProps = {
  selectedFormat: FormatoTipo;
  onSelectFormat: (format: FormatoTipo) => void;
  onPricesLoad: (prices: Record<FormatoTipo, number>) => void;
};

export default function FormatoSelector({
  selectedFormat,
  onSelectFormat,
  onPricesLoad,
}: FormatoSelectorProps) {
  const [prices, setPrices] = useState<Record<FormatoTipo, number>>(DEFAULT_PRECOS);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const docRef = doc(db, 'config', 'mensagem');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const updatedPrices = { ...DEFAULT_PRECOS };
          (Object.keys(DEFAULT_PRECOS) as FormatoTipo[]).forEach((key) => {
            if (typeof data[key] === 'number') {
              updatedPrices[key] = data[key];
            }
          });
          setPrices(updatedPrices);
          onPricesLoad(updatedPrices);
        }
      } catch (err) {
        console.warn('Falha ao carregar preços. Usando valores padrão.', err);
        onPricesLoad(DEFAULT_PRECOS);
      }
    };

    fetchPrices();
  }, [onPricesLoad]);

  return (
    <div className="border-t pt-4 mt-4 space-y-3">
      <h2 className="text-lg font-semibold text-gray-800 text-center">Formato de envio</h2>
      <div className="grid grid-cols-1 gap-3">
        {(Object.keys(LABELS) as FormatoTipo[]).map((key) => (
          <label
            key={key}
            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedFormat === key
                ? 'border-red-900 bg-red-50'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name="format"
              checked={selectedFormat === key}
              onChange={() => onSelectFormat(key)}
              className="sr-only"
            />
            <div className="flex-1 text-gray-800 font-medium">{LABELS[key]}</div>
            <div className="text-gray-600">
              {prices[key] === 0 ? 'Grátis' : `R$ ${prices[key].toFixed(2)}`}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}