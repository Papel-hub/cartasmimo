'use client';

import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { 
  DevicePhoneMobileIcon, 
  EnvelopeIcon, 
  SpeakerWaveIcon, 
  VideoCameraIcon, 
  SparklesIcon 
} from '@heroicons/react/24/outline';

export type FormatoTipo =
  | 'digital'
  | 'fisico'
  | 'digital_audio'
  | 'digital_video'
  | 'digital_fisico_audio'
  | 'full_premium';

const DEFAULT_PRECOS: Record<FormatoTipo, number> = {
  digital: 79,
  fisico: 129,
  digital_audio: 149,
  digital_video: 179,
  digital_fisico_audio: 249,
  full_premium: 319,
};

// Mapeamento de Labels e Ícones para o novo design
const FORMAT_INFO: Record<FormatoTipo, { label: string; icon: any; description: string }> = {
  digital: { label: 'Cartão Digital', icon: DevicePhoneMobileIcon, description: 'Entrega rápida por E-mail ou Whats' },
  fisico: { label: 'Cartão Físico', icon: EnvelopeIcon, description: 'Papel especial e entrega via Correios' },
  digital_audio: { label: 'Digital + Áudio', icon: SpeakerWaveIcon, description: 'Sua voz gravada na mensagem' },
  digital_video: { label: 'Digital + Vídeo', icon: VideoCameraIcon, description: 'Um vídeo especial para emocionar' },
  digital_fisico_audio: { label: 'Digital e Físico + Áudio', icon: SparklesIcon, description: 'O melhor dos dois mundos + Áudio' },
  full_premium: { 
    label: 'Experiência Full Premium', 
    icon: SparklesIcon, 
    description: 'Físico, Digital, Áudio e Vídeo (Completo)' 
  },
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
            if (typeof data[key] === 'number') updatedPrices[key] = data[key];
          });
          setPrices(updatedPrices);
          onPricesLoad(updatedPrices);
        }
      } catch (err) {
        onPricesLoad(DEFAULT_PRECOS);
      }
    };
    fetchPrices();
  }, [onPricesLoad]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-8 h-px bg-gray-200"></span>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Escolha o Formato</h2>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {(Object.keys(FORMAT_INFO) as FormatoTipo[]).map((key) => {
          const Icon = FORMAT_INFO[key].icon;
          const isSelected = selectedFormat === key;

          return (
            <label
              key={key}
              className={`group relative flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-red-900 bg-red-50/50 ring-4 ring-red-900/5'
                  : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="format"
                checked={isSelected}
                onChange={() => onSelectFormat(key)}
                className="sr-only"
              />
              
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl transition-colors ${
                  isSelected ? 'bg-red-900 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className={`font-bold text-sm ${isSelected ? 'text-red-950' : 'text-gray-700'}`}>
                    {FORMAT_INFO[key].label}
                  </p>
<p className="text-[11px] text-gray-400">
  {key.includes('audio') || key.includes('video') || key === 'full_premium' 
    ? 'Inclui mídia personalizada' 
    : 'Apenas mensagem'}
</p>
                </div>
              </div>

              <div className={`font-semibold text-sm ${isSelected ? 'text-red-900' : 'text-gray-900'}`}>
                {prices[key] === 0 ? 'Grátis' : `R$ ${prices[key].toFixed(2)}`}
              </div>

              {/* Checkmark animado */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-red-900 text-white rounded-full p-1 shadow-lg animate-in zoom-in">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}