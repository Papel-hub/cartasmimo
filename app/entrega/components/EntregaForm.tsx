'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import EntregaTypeSection from './EntregaTypeSection';
import DeliveryCalendar from './DeliveryCalendar';
import DeliveryMethodSection from './DeliveryMethodSection';

type DigitalMethod = 'whatsapp' | 'email';
type FisicaMethod = 'correios' | 'local'| 'taxi';

export default function EntregaForm() {
  const router = useRouter();

  const [tipoEntrega, setTipoEntrega] = useState<'digital' | 'fisica' | 'ambos'>('digital');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [digitalMethod, setDigitalMethod] = useState<DigitalMethod | null>(null);
  const [fisicaMethod, setFisicaMethod] = useState<FisicaMethod | null>(null);

  useEffect(() => {
    const loadData = () => {
      const mensagemStr = localStorage.getItem('mimo_mensagem');
      if (!mensagemStr) {
        router.push('/home');
        return;
      }

      try {
        const mensagem = JSON.parse(mensagemStr);
        const format = mensagem.format;

        // 1. Define o tipo de entrega baseado no formato comprado
        let currentTipo: 'digital' | 'fisica' | 'ambos' = 'digital';
        if (format === 'fisico') currentTipo = 'fisica';
        else if (format === 'full_premium') currentTipo = 'ambos';
        
        setTipoEntrega(currentTipo);

        // 2. Tenta restaurar seleções anteriores do usuário para facilitar
        const savedSelection = localStorage.getItem('deliverySelection');
        if (savedSelection) {
          const parsed = JSON.parse(savedSelection);
          // Só restaura se o tipo de entrega salvo for compatível com o plano atual
          if (parsed.tipoEntrega === currentTipo) {
            if (parsed.dataEntrega) setSelectedDate(new Date(parsed.dataEntrega));
            if (parsed.metodoDigital) setDigitalMethod(parsed.metodoDigital);
            if (parsed.metodoFisico) setFisicaMethod(parsed.metodoFisico);
          }
        }
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
      }
    };

    loadData();
  }, [router]);

  const canContinue = (): boolean => {
    if (!selectedDate) return false;
    if (tipoEntrega === 'digital') return !!digitalMethod;
    if (tipoEntrega === 'fisica') return !!fisicaMethod;
    if (tipoEntrega === 'ambos') return !!digitalMethod && !!fisicaMethod;
    return false;
  };

  const handleContinue = () => {
    if (!canContinue() || !selectedDate) return;

    const deliverySelection = {
      tipoEntrega,
      dataEntrega: selectedDate.toISOString(),
      metodoDigital: digitalMethod,
      metodoFisico: fisicaMethod,
    };

    localStorage.setItem('deliverySelection', JSON.stringify(deliverySelection));
    router.push('/dados-entrega');
  };

  return (
    <div className="bg-white rounded-2xl shadow-md space-y-6 max-w-xl mx-auto p-6 border border-gray-100">
      {/* 1. Mostra apenas o tipo fixo do plano */}
      <EntregaTypeSection 
        tipoEntrega={tipoEntrega} 
        setTipoEntrega={setTipoEntrega} 
      />

      {/* 2. Calendário (Sempre visível) */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Quando devemos entregar?</h3>
        <DeliveryCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      </div>

      {/* 3. Métodos Dinâmicos */}
      <div className="space-y-4">
        {(tipoEntrega === 'digital' || tipoEntrega === 'ambos') && (
          <DeliveryMethodSection<DigitalMethod>
            title="Como enviamos o link digital?"
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
            title="Como entregamos o presente físico?"
            options={[
              { id: 'correios', label: 'Correios (PAC)' },
              { id: 'local', label: 'Retirar no Local' },
              { id: 'taxi', label: 'Delivery / Uber / Taxi' },
            ]}
            selected={fisicaMethod}
            onSelect={setFisicaMethod}
          />
        )}
      </div>

      {/* Botões de Ação */}
      <div className="pt-6 space-y-3">
        <button
          onClick={handleContinue}
          disabled={!canContinue()}
          className="w-full py-4 bg-red-900 text-white rounded-full font-bold hover:bg-red-800 transition shadow-lg disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
        >
          {canContinue() ? 'Continuar' : 'Preencha os campos acima'}
        </button>

        <button
          onClick={() => router.back()}
          className="w-full py-2 text-gray-400 text-sm hover:text-gray-600 transition"
        >
          Voltar 
        </button>
      </div>
    </div>
  );
}