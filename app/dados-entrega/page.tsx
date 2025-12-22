'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

import DestinatarioField from './components/DestinatarioField';
import DigitalFields from './components/DigitalFields';
import FisicaFields from './components/FisicaFields';
import { MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

type DeliverySelection = {
  tipoEntrega: 'digital' | 'fisica' | 'ambos';
  dataEntrega: string | null;      // Mudou de selectedDate para dataEntrega
  metodoDigital: 'whatsapp' | 'email' | null; // Mudou de metodoDigital para metodoDigital
  metodoFisico: 'correios' | 'local' | null;  // Mudou de fisicaMethod para metodoFisico
};

export default function DadosEntregaPage() {
  const router = useRouter();

  // Estados dos Campos
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [destinatario, setDestinatario] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cpe, setCpe] = useState('');

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

const isDigital = deliveryData.tipoEntrega === 'digital' || deliveryData.tipoEntrega === 'ambos';
const isFisica = deliveryData.tipoEntrega === 'fisica' || deliveryData.tipoEntrega === 'ambos';
const isLocal = deliveryData.metodoFisico === 'local'; 

  const handleContinue = () => {
    let isValid = true;

    // 1. Validação Destinatário
    if (!destinatario.trim()) isValid = false;

    // 2. Validação Digital
    if (isDigital) {
      if (deliveryData.metodoDigital === 'email' && !email.includes('@')) isValid = false;
      if (deliveryData.metodoDigital === 'whatsapp' && !whatsapp.trim()) isValid = false;
    }

    // 3. Validação Física (Somente se não for levantamento local)
    if (isFisica && !isLocal) {
      if (!endereco.trim() || !cpe.trim()) isValid = false;
    }

    if (!isValid) {
      alert('Por favor, preencha os campos obrigatórios para continuar.');
      return;
    }

    // Preparação dos dados para o Firebase/Painel
    const fullDeliveryData = {
      ...deliveryData,
      destinatario,
      email: isDigital && deliveryData.metodoDigital === 'email' ? email : null,
      whatsapp: isDigital && deliveryData.metodoDigital === 'whatsapp' ? whatsapp : null,
      // Se for local, marcamos o endereço como Ponto de Recolha
      endereco: isLocal ? 'LEVANTAMENTO NO LOCAL' : endereco,
      cpe: isLocal ? 'LOCAL' : cpe,
      dataFinalizacaoDados: new Date().toISOString()
    };

    localStorage.setItem('fullDeliveryData', JSON.stringify(fullDeliveryData));
    router.push('/pagamento');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow sm:px-16 px-6 pt-28 pb-12">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">Dados de Entrega</h1>
            <p className="text-gray-500 mt-2 text-sm">Quase lá! Precisamos saber quem recebe o Mimo.</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 space-y-10 border border-gray-100">
            
            {/* Seção 1: Identificação */}
            <section className="space-y-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                <span className="w-8 h-px bg-gray-200"></span>
                Destinatário
              </h2>
              <DestinatarioField value={destinatario} onChange={setDestinatario} />
            </section>

            {/* Seção 2: Digital (Opcional por contexto) */}
            {isDigital && (
              <section className="space-y-4 animate-in fade-in duration-500">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                  <span className="w-8 h-px bg-gray-200"></span>
                  Entrega Digital via {deliveryData.metodoDigital}
                </h2>
                <DigitalFields
                  method={deliveryData.metodoDigital}
                  email={email} setEmail={setEmail}
                  whatsapp={whatsapp} setWhatsapp={setWhatsapp}
                />
              </section>
            )}

            {/* Seção 3: Física ou Levantamento */}
            {isFisica && (
              <section className="space-y-4 animate-in fade-in duration-700">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                  <span className="w-8 h-px bg-gray-200"></span>
                  {isLocal ? 'Instruções de Recolha' : 'Dados de Envio (Correios)'}
                </h2>

                {isLocal ? (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 space-y-4">
                    <div className="flex gap-4">
                      <div className="bg-indigo-600 p-2.5 rounded-xl text-white h-fit shadow-md shadow-indigo-200">
                        <MapPinIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-indigo-950 text-base">Ponto de Recolha</p>
                        <p className="text-indigo-800/80 text-sm leading-relaxed">
                          Rua Exemplo, 123 - Centro<br />
                          Campo Grande - MS
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 pt-2 border-t border-indigo-200/50">
                      <ClockIcon className="w-5 h-5 text-indigo-500" />
                      <p className="text-xs text-indigo-700 font-medium">
                        {/* Trocado selectedDate por dataEntrega */}
                        Disponível em: {deliveryData.dataEntrega ? new Date(deliveryData.dataEntrega).toLocaleDateString('pt-BR') : 'A definir'} <br />
                        Horário: a partir das 14:00h
                      </p>
                    </div>
                  </div>
                ) : (
                  <FisicaFields
                    endereco={endereco} setEndereco={setEndereco}
                    cpe={cpe} setCpe={setCpe}
                  />
                )}
              </section>
            )}

            {/* Botões de Ação */}
            <div className="pt-8 space-y-4">
              <button
                onClick={handleContinue}
                className="w-full bg-red-900 text-white py-3 rounded-full font-semibold text-lg hover:bg-red-800 transition-all active:scale-[0.98]"
              >
                Continuar para Pagamento
              </button>
              
              <button
                onClick={() => router.back()}
                className="w-full text-gray-400 font-medium text-sm hover:text-gray-600 transition-colors py-2"
              >
                Voltar e alterar opções
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}