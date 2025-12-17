'use client';

import { useState } from 'react';
import EntregaTypeSection from './EntregaTypeSection';
import DeliveryCalendar from './DeliveryCalendar';
import DeliveryMethodSection from './DeliveryMethodSection';
// Adicione este import no topo
import { useRouter } from 'next/navigation';


type DigitalMethod = 'whatsapp' | 'email';
type FisicaMethod = 'correios' | 'transportadora' | 'ponto' | 'delivery' | 'uber' | 'taxi';
type MaoAmigaMethod = 'cupidos' | 'anfitrioes' | 'influencers' | 'parceiros';

// ✅ Apenas "correios" é válido no momento
const VALID_FISICA_METHODS: FisicaMethod[] = ['correios'];

export default function EntregaForm() {
  const [tipoEntrega, setTipoEntrega] = useState<'digital' | 'fisica' | 'ambos'>('digital');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [digitalMethod, setDigitalMethod] = useState<DigitalMethod | null>(null);
  const [fisicaMethod, setFisicaMethod] = useState<FisicaMethod | null>(null);
  const [maoAmigaMethod, setMaoAmigaMethod] = useState<MaoAmigaMethod | null>(null);
// Dentro do componente EntregaForm
  const router = useRouter();

const handleContinue = () => {
  if (!canContinue()) return;

  const deliveryData = {
    tipoEntrega,
    selectedDate: selectedDate ? selectedDate.toISOString() : null, // salva como string ISO
    digitalMethod,
    fisicaMethod,
    maoAmigaMethod,
  };

  localStorage.setItem('deliverySelection', JSON.stringify(deliveryData));
  router.push('/dados-entrega');
};
  const handleDigitalSelect = (value: DigitalMethod) => {
    setDigitalMethod(value);
    setMaoAmigaMethod(null);
  };

  const handleFisicaSelect = (value: FisicaMethod) => {
    setFisicaMethod(value);
    setMaoAmigaMethod(null);
  };

  const handleMaoAmigaSelect = (value: MaoAmigaMethod) => {
    setMaoAmigaMethod(value);
    setDigitalMethod(null);
    setFisicaMethod(null);
  };

  // ✅ Validação ajustada: só aceita "correios" como método físico válido
  const canContinue = () => {
    if (maoAmigaMethod) {
      return true;
    }

    if (tipoEntrega === 'digital') {
      return digitalMethod !== null;
    }

    if (tipoEntrega === 'fisica') {
      return fisicaMethod !== null && VALID_FISICA_METHODS.includes(fisicaMethod);
    }

    if (tipoEntrega === 'ambos') {
      const hasValidDigital = digitalMethod !== null;
      const hasValidFisica = fisicaMethod !== null && VALID_FISICA_METHODS.includes(fisicaMethod);
      return hasValidDigital && hasValidFisica;
    }

    return false;
  };

  // ✅ Verifica se um método físico está selecionado, mas não é válido
  const hasInvalidFisicaSelection = fisicaMethod !== null && !VALID_FISICA_METHODS.includes(fisicaMethod);

  return (
    <div className="bg-white rounded-2xl shadow-md space-y-6 max-w-xl mx-auto p-6 border border-gray-100">
      <EntregaTypeSection tipoEntrega={tipoEntrega} setTipoEntrega={setTipoEntrega} />
      <DeliveryCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />

      {(tipoEntrega === 'digital' || tipoEntrega === 'ambos') && (
        <DeliveryMethodSection<DigitalMethod>
          title="Entregas Digitais"
          options={[
            { id: 'whatsapp', label: 'WhatsApp' },
            { id: 'email', label: 'E-mail' },
          ]}
          selected={digitalMethod}
          onSelect={handleDigitalSelect}
        />
      )}

      {(tipoEntrega === 'fisica' || tipoEntrega === 'ambos') && (
        <DeliveryMethodSection<FisicaMethod>
          title="Entregas Físicas"
          options={[
            { id: 'correios', label: 'Correios' },
            { id: 'transportadora', label: 'Transportadoras/Cliente' },
            { id: 'ponto', label: 'Ponto de Recolha' },
            { id: 'delivery', label: 'Delivery' },
            { id: 'uber', label: 'Uber' },
            { id: 'taxi', label: 'Táxi' },
          ]}
          selected={fisicaMethod}
          onSelect={handleFisicaSelect}
        />
      )}

      {/* Aviso sutil se método físico não suportado for escolhido */}
      {hasInvalidFisicaSelection && (
        <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded-md border border-amber-200">
          Apenas <strong>Correios</strong> está disponível no momento para entregas físicas.
        </p>
      )}

      <DeliveryMethodSection<MaoAmigaMethod>
        title="Entregas Mão Amiga"
        subtitle="(Reservado para parceiros)"
        options={[
          { id: 'cupidos', label: 'Cupidos' },
          { id: 'anfitrioes', label: 'Anfitriões' },
          { id: 'influencers', label: 'Influencers' },
          { id: 'parceiros', label: 'Parceiros' },
        ]}
        selected={maoAmigaMethod}
        onSelect={handleMaoAmigaSelect}
      />

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleContinue} 
          disabled={!canContinue()}
          className="w-full flex items-center justify-center gap-2 font-semibold p-3 bg-red-900 text-white rounded-full hover:bg-red-800 transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 font-semibold p-3 border border-red-900 text-red-900 rounded-full hover:bg-red-50 transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}