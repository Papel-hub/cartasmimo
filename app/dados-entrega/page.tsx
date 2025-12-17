'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

type DeliverySelection = {
  tipoEntrega: 'digital' | 'fisica' | 'ambos';
  selectedDate: string | null;
  digitalMethod: 'whatsapp' | 'email' | null;
  fisicaMethod: 'correios' | null; // só correios válido
  maoAmigaMethod: 'cupidos' | 'anfitrioes' | 'influencers' | 'parceiros' | null;
};

export default function DadosEntregaPage() {
  const router = useRouter();

  // Estados dos dados coletados
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [destinatario, setDestinatario] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cpe, setCpe] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Dados da etapa anterior
  const [deliveryData, setDeliveryData] = useState<DeliverySelection | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('deliverySelection');
    if (!saved) {
      // Se não houver dados, redireciona de volta
      router.push('/entrega');
      return;
    }
    try {
      const parsed = JSON.parse(saved) as DeliverySelection;
      setDeliveryData(parsed);
    } catch (e) {
      router.push('/entrega');
    }
  }, [router]);

  if (!deliveryData) {
    return <div className="flex items-center justify-center min-h-screen"></div>;
  }

  const isDigital = deliveryData.tipoEntrega === 'digital' || deliveryData.tipoEntrega === 'ambos';
  const isFisica = deliveryData.tipoEntrega === 'fisica' || deliveryData.tipoEntrega === 'ambos';
  const isMaoAmiga = !!deliveryData.maoAmigaMethod;

const handleContinue = () => {
  // Validação condicional
  let isValid = true;

  if (isMaoAmiga) {
    // Apenas destinatário é obrigatório (ajuste se necessário)
    if (!destinatario.trim()) isValid = false;
  } else {
    if (isDigital) {
      if (deliveryData.digitalMethod === 'email' && !email.trim()) isValid = false;
      if (deliveryData.digitalMethod === 'whatsapp' && !whatsapp.trim()) isValid = false;
    }
    if (isFisica) {
      if (!destinatario.trim() || !endereco.trim() || !cpe.trim()) isValid = false;
    }
  }

  if (!isValid) {
    alert('Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  // Salvar dados completos no localStorage
  const fullData = {
    ...deliveryData,
    destinatario,
    email,
    whatsapp,
    endereco,
    cpe,
    isAnonymous,
  };
  localStorage.setItem('fullDeliveryData', JSON.stringify(fullData));

  // ✅ Redirecionar para a página de pagamento
  router.push('/pagamento');
};

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow sm:px-16 px-8 pt-24 pb-8 sm:pt-28 sm:pb-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Dados de Entrega</h1>
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            
            {/* Nome do destinatário (sempre visível exceto se anônimo?) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do destinatário
              </label>
              <input
                type="text"
                value={destinatario}
                onChange={(e) => setDestinatario(e.target.value)}
                placeholder="Ex: Maria Silva"
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={isAnonymous}
              />
            </div>

            {/* Campos digitais */}
            {isDigital && !isMaoAmiga && (
              <div className="space-y-4">
                {deliveryData.digitalMethod === 'email' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail do destinatário
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="exemplo@dominio.com"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}
                {deliveryData.digitalMethod === 'whatsapp' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp do destinatário
                    </label>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="91 123 456 789"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Campos físicos */}
            {isFisica && !isMaoAmiga && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço completo
                  </label>
                  <input
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Rua, nº, bairro, cidade"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CEP
                  </label>
                  <input
                    type="text"
                    value={cpe}
                    onChange={(e) => setCpe(e.target.value)}
                    placeholder="Ex: 1234-567"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex items-center p-2">
                 Estimativa do frete:<span className="text-red-900 font-bold"> R$ 100</span>
                </div>
              </div>
            )}

            {/* Checkbox  */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 text-red-600 rounded"
              />
              <label htmlFor="anonymous" className="text-sm text-gray-700">
                Salvar dados como padrão
              </label>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleContinue}
                className="w-full font-semibold bg-red-900 text-white py-3 rounded-full hover:bg-red-800 transition"
              >
                Continuar
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full font-semibold border border-red-900 text-red-900 py-3 rounded-full hover:bg-gray-100 transition"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}