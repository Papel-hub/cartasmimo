'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import EntregaTypeSection from './EntregaTypeSection';
import DeliveryCalendar from './DeliveryCalendar';
import DeliveryMethodSection from './DeliveryMethodSection';

type DigitalMethod = 'whatsapp' | 'email';
type FisicaMethod = 'correios' | 'local'| 'taxi';

type CartItem = {
  id: string;
  title: string;
  price: number;
  audioUrl: string | null;
  videoUrl: string | null;
};

const VALID_FISICA_METHODS: FisicaMethod[] = ['correios'];

export default function EntregaForm() {
  const router = useRouter();

  const [tipoEntrega, setTipoEntrega] = useState<'digital' | 'fisica' | 'ambos'>('digital');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [digitalMethod, setDigitalMethod] = useState<DigitalMethod | null>(null);
  const [fisicaMethod, setFisicaMethod] = useState<FisicaMethod | null>(null);
  const [, setCartItems] = useState<CartItem[]>([]);

  // 1. Efeito para carregar dados do carrinho e validar acesso
  useEffect(() => {
    const loadCart = () => {
      const mensagemStr = localStorage.getItem('mimo_mensagem');
      const audioUrl = localStorage.getItem('mimo_final_audio');
      const videoUrl = localStorage.getItem('mimo_final_video');

      if (!mensagemStr) {
        router.push('/home');
        return;
      }

      try {
        const mensagem = JSON.parse(mensagemStr) as { price?: number };
        setCartItems([
          {
            id: 'mensagem-personalizada',
            title: 'Carta Mimo',
            price: mensagem.price ?? 79,
            audioUrl,
            videoUrl,
          },
        ]);
      } catch {
        router.push('/home');
      }
    };

    loadCart();
  }, [router]);

  // 2. Efeito para restaurar o que foi salvo no LocalStorage anteriormente
  useEffect(() => {
    const savedSelection = localStorage.getItem('deliverySelection');
    if (savedSelection) {
      try {
        const parsed = JSON.parse(savedSelection);
        
        // Restaura a data convertendo de String ISO para Objeto Date
        if (parsed.dataEntrega) {
          setSelectedDate(new Date(parsed.dataEntrega));
        }
        
        // Restaura os outros estados
        if (parsed.tipoEntrega) setTipoEntrega(parsed.tipoEntrega);
        if (parsed.metodoDigital) setDigitalMethod(parsed.metodoDigital);
        if (parsed.metodoFisico) setFisicaMethod(parsed.metodoFisico);
      } catch (e) {
        console.error("Erro ao recuperar seleção de entrega:", e);
      }
    }
  }, []);

  const canContinue = (): boolean => {
    if (!selectedDate) return false;

    if (tipoEntrega === 'digital') {
      return digitalMethod !== null;
    }

    if (tipoEntrega === 'fisica') {
      return fisicaMethod !== null && VALID_FISICA_METHODS.includes(fisicaMethod);
    }

    if (tipoEntrega === 'ambos') {
      return (
        digitalMethod !== null &&
        fisicaMethod !== null &&
        VALID_FISICA_METHODS.includes(fisicaMethod)
      );
    }

    return false;
  };

  const handleContinue = () => {
    if (!canContinue() || !selectedDate) return;

    const deliverySelection = {
      tipoEntrega,
      // Salva a data como ISOString para garantir persistência correta
      dataEntrega: selectedDate.toISOString(), 
      metodoDigital: digitalMethod,
      metodoFisico: fisicaMethod,
      // Mantém referências dos arquivos se existirem
      arquivos: {
        audio: localStorage.getItem('mimo_final_audio'),
        video: localStorage.getItem('mimo_final_video'),
      },
    };

    localStorage.setItem('deliverySelection', JSON.stringify(deliverySelection));
    router.push('/dados-entrega');
  };

  return (
    <div className="bg-white rounded-2xl shadow-md space-y-6 max-w-xl mx-auto p-6 border border-gray-100">
      <EntregaTypeSection
        tipoEntrega={tipoEntrega}
        setTipoEntrega={setTipoEntrega}
      />

      <DeliveryCalendar
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />

      {(tipoEntrega === 'digital' || tipoEntrega === 'ambos') && (
        <DeliveryMethodSection<DigitalMethod>
          title="Método Digital"
          options={[
            { id: 'whatsapp', label: 'WhatsApp' },
            { id: 'email', label: 'E-mail' },
          ]}
          selected={digitalMethod}
          onSelect={setDigitalMethod}
        />
      )}

      {(tipoEntrega === 'fisica' || tipoEntrega === 'ambos') && (
        <DeliveryMethodSection<FisicaMethod>
          title="Método Físico"
          options={[
            { id: 'correios', label: 'Correios' },
            { id: 'local', label: 'Retirar no Local' },
            { id: 'taxi', label: 'Delivery / Uber / Taxi' },
          ]}
          selected={fisicaMethod}
          onSelect={setFisicaMethod}
        />
      )}

{ (fisicaMethod === 'local' || fisicaMethod === 'taxi') && (
  <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
    Atualmente apenas os <strong>Correios</strong> estão disponíveis.
  </p>
)}

      <div className="pt-4 space-y-3">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue()}
          className="w-full py-3 bg-red-900 text-white rounded-full font-bold hover:bg-red-800 transition disabled:bg-gray-200 disabled:text-gray-400"
        >
          Continuar
        </button>

        <button
          onClick={() => router.back()}
          className="w-full py-2 text-gray-400 text-sm hover:underline"
        >
          Voltar e alterar mídia
        </button>
      </div>
    </div>
  );
}