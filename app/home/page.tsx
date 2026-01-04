'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import MensagemPreview from './components/MensagemPreview';
import FormatoSelector, { FormatoTipo } from './components/FormatoSelector';
import MensagemForm from './components/MensagemForm';
import BtnCoracao from './components/BtnCoracao';
import CartasDoCoracaoSelector from './components/CartasDoCoracaoSelector';

// Importações do Firebase
import { db } from '../../lib/firebaseConfig'; 
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

interface Carta {
  id: string;
  titulo: string;
  conteudo: string;
}
export default function HomePage() {
  const router = useRouter();
  
  // Estados do Formulário
  const [isChecked, setIsChecked] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');
  const [usarCarta, setUsarCarta] = useState(false);
  const [mensagemSelecionada, setMensagemSelecionada] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<FormatoTipo>('digital');
  
  // Estados de Dados do Firebase
  const [loading, setLoading] = useState(true);
  const [cartasDoCoracao, setCartasDoCoracao] = useState<Carta[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [prices, setPrices] = useState<Record<FormatoTipo, number>>({
    digital: 10, 
    fisico: 10, 
    digital_audio: 10, 
    digital_video: 10, 
    digital_audio_video: 10, 
    full_premium: 10,
  });

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Buscar Mensagens Predefinidas
      const querySnapshot = await getDocs(collection(db, "mensagens_predefinidas"));
      const frases: Carta[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.texto) {
          frases.push({
            id: doc.id,
            titulo: data.titulo || "Sem Título", // Fallback caso não tenha título
            conteudo: data.texto
          });
        }
      });
      setCartasDoCoracao(frases);

        // 2. Buscar Preços (Documento específico)
        const precosDoc = await getDoc(doc(db, "precos_carta", "precos"));
        if (precosDoc.exists()) {
          setPrices(precosDoc.data() as Record<FormatoTipo, number>);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do Firebase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

const handleGoToNextStep = () => {
    if (!to || (!message && !mensagemSelecionada)) {
      alert("Por favor, preencha para quem é o Mimo e a mensagem.");
      return;
    }

    // 1. Limpeza de Segurança (Reset)
    // Isso garante que se o usuário pulou a página de mídia, 
    // não exista nenhuma URL antiga sobrando no navegador.
    localStorage.removeItem('mimo_final_audio');
    localStorage.removeItem('mimo_final_video');
    localStorage.removeItem('mimo_midia_audio'); 
    localStorage.removeItem('mimo_midia_video'); 

    localStorage.removeItem('valor_frete'); 
    localStorage.removeItem('prazo_frete'); 
    localStorage.removeItem('servico_frete'); 
    localStorage.removeItem('frete_info_completo'); 

    localStorage.removeItem('deliverySelection'); 

    const mensagemFinal = usarCarta && mensagemSelecionada ? mensagemSelecionada : message;
    
    const mensagemData = {
      from: isChecked ? 'Anônimo' : from || '',
      to: to || '',
      message: mensagemFinal || '',
      format: selectedFormat, // 'digital', 'fisica', 'full_premium', etc.
      price: prices[selectedFormat],
      timestamp: Date.now(),
    };

    localStorage.setItem('mimo_mensagem', JSON.stringify(mensagemData));

    // Verificação de para onde enviar o usuário
    const needsAudio = ['digital_audio', 'digital_audio_video', 'full_premium'].includes(selectedFormat);
    const needsVideo = ['digital_video', 'digital_audio_video', 'full_premium'].includes(selectedFormat);

    if (needsAudio && needsVideo) {
      router.push('/midia?tipo=both');
    } else if (needsVideo) {
      router.push('/midia?tipo=video');
    } else if (needsAudio) {
      router.push('/midia?tipo=audio');
    } else {
      // Se for "digital" simples, ele cai aqui. 
      // Como limpamos o localStorage acima, o Firebase salvará NULL corretamente.
      router.push('/entrega');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow px-4 sm:px-8 lg:px-16 pt-24 pb-12 sm:pt-32">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Personalize seu Mimo</h1>
            <p className="text-gray-500 mt-2">Escreva sua mensagem e escolha o formato ideal.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            
            {/* COLUNA 1: PREVIEW */}
            <div className="lg:sticky lg:top-32 order-1">
              <div className="bg-white/50 rounded-3xl border border-dashed border-gray-200 lg:border-none lg:p-0">
                <MensagemPreview 
                  from={from} 
                  to={to} 
                  message={message || mensagemSelecionada} 
                  isChecked={isChecked} 
                />
              </div>
            </div>

            {/* COLUNA 2: FORMULÁRIO */}
            <div className="space-y-8 bg-white p-6 rounded-lg shadow-xl shadow-gray-200/60 border border-gray-100 order-2">
              <MensagemForm
                isChecked={isChecked}
                onToggleAnonimo={setIsChecked}
                from={from}
                to={to}
                message={message}
                onFromChange={setFrom}
                onToChange={setTo}
                onMessageChange={(msg) => {
                  setMessage(msg);
                  setUsarCarta(false);
                  setMensagemSelecionada('');
                }}
              />

              <div className="relative">
                <BtnCoracao onClick={() => setUsarCarta(!usarCarta)} />
                {usarCarta && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {loading ? (
                      <div className="flex justify-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-900"></div>
                      </div>
                    ) : (
<CartasDoCoracaoSelector
  cartas={cartasDoCoracao}
  selectedId={selectedId} 
  onSelect={(carta) => {
    setSelectedId(carta.id);
    setMessage(carta.conteudo); 
    // Se quiser que fique aberto para leitura, remova o setUsarCarta(false) daqui
  }}
/>
                    )}
                  </div>
                )}
              </div>

              <hr className="border-gray-50" />

              {/* Passamos os preços carregados do Firebase para o seletor */}
              <FormatoSelector
                selectedFormat={selectedFormat}
                onSelectFormat={setSelectedFormat}
                prices={prices} // Verifique se o seu FormatoSelector aceita essa prop
              />

              <button
                onClick={handleGoToNextStep}
                disabled={loading}
                className="w-full bg-red-900 text-white py-3 rounded-full font-semibold text-lg hover:bg-red-800 transition-all active:scale-[0.98] flex justify-center items-center disabled:opacity-50"
              >
                {loading ? (
                  "Carregando..."
                ) : (
                  prices[selectedFormat] > 0 
                    ? `Continuar • R$ ${prices[selectedFormat].toFixed(2).replace('.', ',')}` 
                    : 'Continuar'
                )}
              </button>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}