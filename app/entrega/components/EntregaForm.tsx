'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import EntregaTypeSection from './EntregaTypeSection';
import DeliveryCalendar from './DeliveryCalendar';
import DeliveryMethodSection from './DeliveryMethodSection';
import { useRouter } from 'next/navigation';

type DigitalMethod = 'whatsapp' | 'email';
type FisicaMethod = 'correios' | 'local';

const VALID_FISICA_METHODS: FisicaMethod[] = ['correios'];

export default function EntregaForm() {
  const router = useRouter();
  
  const [tipoEntrega, setTipoEntrega] = useState<'digital' | 'fisica' | 'ambos'>('digital');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [digitalMethod, setDigitalMethod] = useState<DigitalMethod | null>(null);
  const [fisicaMethod, setFisicaMethod] = useState<FisicaMethod | null>(null);
  
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    const loadCart = () => {
      const mensagemStr = localStorage.getItem('mimo_mensagem');
      // Importante: Estas são as URLs que a tua API na VPS devolveu
      const audioUrl = localStorage.getItem('mimo_final_audio'); 
      const videoUrl = localStorage.getItem('mimo_final_video');

      if (!mensagemStr) {
        router.push('/home');
        return;
      }

      try {
        const mensagem = JSON.parse(mensagemStr);
        setCartItems([{
          id: 'mensagem-personalizada',
          title: 'Carta Mimo',
          price: mensagem.price || 79,
          audioUrl, // Referência para o ficheiro na VPS
          videoUrl  // Referência para o ficheiro na VPS
        }]);
      } catch (err) {
        router.push('/home');
      }
    };

    loadCart();
  }, [router]);

  const canContinue = () => {
    if (!selectedDate) return false;
    if (tipoEntrega === 'digital') return !!digitalMethod;
    if (tipoEntrega === 'fisica') return !!fisicaMethod && VALID_FISICA_METHODS.includes(fisicaMethod);
    if (tipoEntrega === 'ambos') return !!digitalMethod && !!fisicaMethod && VALID_FISICA_METHODS.includes(fisicaMethod);
    return false;
  };

  const handleContinue = () => {
    if (!canContinue()) return;

    // Criamos o objeto que será enviado para o Firestore na próxima página
    const deliverySelection = {
      tipoEntrega,
      dataEntrega: selectedDate?.toISOString(),
      metodoDigital: digitalMethod,
      metodoFisico: fisicaMethod,
      // Incluímos as referências dos ficheiros que estão na VPS
      arquivos: {
        audio: localStorage.getItem('mimo_final_audio'),
        video: localStorage.getItem('mimo_final_video')
      }
    };

    localStorage.setItem('deliverySelection', JSON.stringify(deliverySelection));
    router.push('/dados-entrega');
  };

  return (
    <div className="bg-white rounded-2xl shadow-md space-y-6 max-w-xl mx-auto p-6 border border-gray-100">
      
      <EntregaTypeSection tipoEntrega={tipoEntrega} setTipoEntrega={setTipoEntrega} />
      
      <DeliveryCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />

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
            { id: 'local', label: 'Levantamento Local' },
          ]}
          selected={fisicaMethod}
          onSelect={setFisicaMethod}
        />
      )}

      {/* Alerta de restrição de método */}
      {fisicaMethod === 'local' && (
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