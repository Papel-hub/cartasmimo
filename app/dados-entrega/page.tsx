'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

import DestinatarioField from './components/DestinatarioField';
import DigitalFields from './components/DigitalFields';
import FisicaFields from './components/FisicaFields';
import AnonymousCheckbox from './components/AnonymousCheckbox';

type DeliverySelection = {
  tipoEntrega: 'digital' | 'fisica' | 'ambos';
  selectedDate: string | null;
  digitalMethod: 'whatsapp' | 'email' | null;
  fisicaMethod: 'correios' | null;
  maoAmigaMethod: 'cupidos' | 'anfitrioes' | 'influencers' | 'parceiros' | null;
};

export default function DadosEntregaPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [destinatario, setDestinatario] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cpe, setCpe] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [deliveryData, setDeliveryData] = useState<DeliverySelection | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('deliverySelection');
    if (!saved) {
      router.push('/entrega');
      return;
    }
    try {
      setDeliveryData(JSON.parse(saved));
    } catch {
      router.push('/entrega');
    }
  }, [router]);

  if (!deliveryData) return null;

  const isDigital =
    deliveryData.tipoEntrega === 'digital' || deliveryData.tipoEntrega === 'ambos';
  const isFisica =
    deliveryData.tipoEntrega === 'fisica' || deliveryData.tipoEntrega === 'ambos';
  const isMaoAmiga = Boolean(deliveryData.maoAmigaMethod);

  const handleContinue = () => {
    let isValid = true;

    if (isMaoAmiga) {
      if (!destinatario.trim()) isValid = false;
    } else {
      if (isDigital) {
        if (deliveryData.digitalMethod === 'email' && !email.trim()) isValid = false;
        if (deliveryData.digitalMethod === 'whatsapp' && !whatsapp.trim()) isValid = false;
      }
      if (isFisica) {
        if (!destinatario || !endereco || !cpe) isValid = false;
      }
    }

    if (!isValid) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    localStorage.setItem(
      'fullDeliveryData',
      JSON.stringify({
        ...deliveryData,
        destinatario,
        email,
        whatsapp,
        endereco,
        cpe,
        isAnonymous,
      })
    );

    router.push('/pagamento');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow sm:px-16 px-8 pt-24 pb-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-center mb-6">Dados de Entrega</h1>

          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <DestinatarioField
              value={destinatario}
              onChange={setDestinatario}
              disabled={isAnonymous}
            />

            {isDigital && !isMaoAmiga && (
              <DigitalFields
                method={deliveryData.digitalMethod}
                email={email}
                setEmail={setEmail}
                whatsapp={whatsapp}
                setWhatsapp={setWhatsapp}
              />
            )}

            {isFisica && !isMaoAmiga && (
              <FisicaFields
                endereco={endereco}
                setEndereco={setEndereco}
                cpe={cpe}
                setCpe={setCpe}
              />
            )}

            <AnonymousCheckbox
              checked={isAnonymous}
              onChange={setIsAnonymous}
            />

            <div className="space-y-3">
              <button
                onClick={handleContinue}
                className="w-full bg-red-900 text-white py-3 rounded-full font-semibold hover:bg-red-800"
              >
                Continuar
              </button>

              <button
                onClick={() => router.back()}
                className="w-full border border-red-900 text-red-900 py-3 rounded-full font-semibold"
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
