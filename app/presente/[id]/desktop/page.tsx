'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../../../../lib/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import {
  FaPlay,
  FaVolumeUp,
  FaInfoCircle,
  FaTimes,
  FaUndo,
} from 'react-icons/fa';
import Image from 'next/image';



// Tipagem local para evitar 'any'
interface PedidoData {
  conteudo?: {
    de?: string;
    para?: string;
    texto?: string;
    audio_url?: string;
    video_url?: string;
  };
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function PresenteCliente({ params }: PageProps) {

  const [pedido, setPedido] = useState<PedidoData | null>(null);
  const [step, setStep] = useState<number>(0); // 0: Fechado, 1: Aberto, 2: Final
  const [loading, setLoading] = useState<boolean>(true);
  const [activeModal, setActiveModal] = useState<'video' | 'audio' | null>(null);
  const [id, setId] = useState<string | null>(null);

  // 2. Desembrulhe a Promise do params
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;

    const fetchPedido = async () => {
      try {
        const docRef = doc(db, "pedidos", id);
        const res = await getDoc(docRef);
        if (res.exists()) {
          setPedido(res.data() as PedidoData);
        }
      } catch (error) {
        console.error("Erro ao buscar pedido:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPedido();
  }, [id]);



  if (loading) return (
    <div className="min-h-screen bg-stone-300 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-red-900"></div>
    </div>
  );

  if (!pedido) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f1ea]">
      <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-stone-200">
        <FaInfoCircle className="mx-auto text-stone-300 mb-4 text-3xl" />
        <p className="font-sans font-bold text-stone-600">Presente não encontrado.</p>
      </div>
    </div>
  );

  const temMidia = !!(pedido.conteudo?.audio_url || pedido.conteudo?.video_url);

  return (
    <div className="min-h-[100dvh] bg-[#f4f1ea] flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden relative selection:bg-red-100">
      
      {/* CONTAINER DO LIVRO INTERATIVO */}
      <div 
        className="relative w-full max-w-[320px] sm:max-w-[350px] aspect-[7/10] sm:h-[500px]"
        style={{ perspective: '2000px' }}
      >
        
        {/* --- FOLHA 2: MÍDIA (Frente) / VERSO FINAL (Verso) --- */}
        <div 
          className="absolute inset-0 duration-1000 ease-in-out origin-left transition-transform shadow-2xl"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: step === 2 ? 'rotateY(-180deg)' : 'rotateY(0deg)',
            zIndex: step === 2 ? 30 : 10
          }}
          onClick={() => step === 1 && setStep(2)}
        >
          {/* FRENTE: PÁGINA 3 (Mídia) */}
          <div className="absolute inset-0 backface-hidden rounded-r-lg bg-stone-50 border-l border-stone-200 overflow-hidden cursor-pointer">
            <Image 
              src="/images/carta3.svg" 
              alt="Background Mídia" 
              fill 
              className="object-cover select-none pointer-events-none" 
            />
            
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none" />

            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-8 z-20">
                {temMidia ? (
                  <div className={`w-full space-y-4 transition-opacity duration-500 ${step === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="text-center mb-4">
                       <p className="text-[10px] font-black tracking-widest text-stone-400 uppercase">Sua Surpresa</p>
                    </div>

                    {pedido.conteudo?.audio_url && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveModal('audio'); }}
                        className="w-full flex items-center justify-between bg-white/95 p-4 rounded-xl border border-stone-200 text-xs font-bold shadow-sm active:scale-95 transition-all hover:bg-stone-50"
                      >
                        <span className="flex items-center gap-3"><FaVolumeUp className="text-red-800" /> OUVIR ÁUDIO</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                      </button>
                    )}

                    {pedido.conteudo?.video_url && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveModal('video'); }}
                        className="w-full flex items-center justify-between bg-stone-900 p-4 rounded-xl text-white text-xs font-bold shadow-lg active:scale-95 transition-all hover:bg-stone-800"
                      >
                        <span className="flex items-center gap-3"><FaPlay className="text-red-500" /> VER VÍDEO</span>
                        <FaPlay className="opacity-20" size={10} />
                      </button>
                    )}
                    <p className="text-[9px] text-stone-400 text-center animate-pulse mt-6 font-medium uppercase tracking-widest">Clique na página para fechar</p>
                  </div>
                ) : (
                   <div className="text-center opacity-30">
                      <FaInfoCircle className="mx-auto mb-2 text-xl" />
                      <p className="text-[10px] italic">Sem mídia disponível.</p>
                   </div>
                )}
            </div>
          </div>

          {/* VERSO: CARTA 4 (Contracapa Final) */}
          <div 
            className="absolute inset-0 backface-hidden rounded-l-lg overflow-hidden bg-white"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <Image src="/images/carta4.svg" alt="Verso Final" fill className="object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <p className="text-stone-800 font-serif italic text-sm mb-4">Esperamos que tenha gostado!</p>
                <button 
                  onClick={() => setStep(0)}
                  className="flex items-center gap-3 mx-auto bg-stone-900 text-white px-8 py-3 rounded-full text-xs font-black tracking-widest active:scale-95 transition-all hover:bg-red-900 shadow-lg"
                >
                  <FaUndo size={12} /> REVER DO INÍCIO
                </button>
            </div>
          </div>
        </div>

        {/* --- FOLHA 1: CAPA (Frente) / MENSAGEM (Verso) --- */}
        <div 
          className="absolute inset-0 duration-1000 ease-in-out origin-left transition-transform cursor-pointer"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: step >= 1 ? 'rotateY(-180deg)' : 'rotateY(0deg)',
            zIndex: step === 0 ? 40 : 20
          }}
          onClick={() => step === 0 && setStep(1)}
        >
          {/* FRENTE: CAPA (Carta 1) */}
          <div className="absolute inset-0 backface-hidden shadow-2xl rounded-r-lg overflow-hidden">
            <Image src="/images/carta1.svg" alt="Capa" fill className="object-cover" priority />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
               <div className="mt-16 sm:mt-24 space-y-2">
                 <p className="text-white font-serif italic text-sm opacity-80">Especialmente para:</p>
                 <p className="text-white font-black italic text-xl uppercase tracking-[0.25em] drop-shadow-lg">
                   {pedido.conteudo?.para}
                 </p>
               </div>
               <div className="absolute bottom-12 text-white/50 text-[10px] tracking-[0.3em] uppercase animate-bounce font-bold">
                 Toque para abrir
               </div>
            </div>
          </div>

          {/* VERSO: PÁGINA 2 (Texto - Carta 2) */}
          <div 
            className="absolute inset-0 backface-hidden rounded-l-lg overflow-hidden bg-white"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <Image src="/images/carta2.svg" alt="Background Texto" fill className="object-cover" />
            
            <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/5 to-transparent pointer-events-none" />

            <div className="relative p-8 sm:p-10 h-full">
               {/* Posicionamento preciso para o layout da imagem */}
               <div className="absolute top-[49.5%] left-[25%] w-[45%] text-[11px] sm:text-[13px] font-bold text-stone-800 truncate">
                 {pedido.conteudo?.de}
               </div>
               <div className="absolute top-[54.5%] left-[29%] w-[45%] text-[11px] sm:text-[13px] font-bold text-stone-800 truncate">
                 {pedido.conteudo?.para}
               </div>
               <div className="absolute top-[63%] left-[20%] w-[50%] text-[10px] sm:text-[12px] text-stone-700 font-serif italic leading-relaxed max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
                  {pedido.conteudo?.texto}
               </div>
              
            </div>
          </div>
        </div>

      </div>

      {/* --- MODAL DE MÍDIA --- */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] bg-stone-950/98 flex items-center justify-center p-4 backdrop-blur-xl">
          <button 
            onClick={() => setActiveModal(null)} 
            className="absolute top-6 right-6 text-white/40 hover:text-white text-3xl transition-colors p-2"
          >
            <FaTimes />
          </button>
          
          <div className="w-full max-w-2xl bg-black rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5">
            {activeModal === 'video' ? (
              <div className="aspect-video w-full">
                <iframe 
                  src={pedido.conteudo?.video_url} 
                  className="w-full h-full" 
                  allow="autoplay; fullscreen" 
                  title="Vídeo Presente"
                />
              </div>
            ) : (
              <div className="p-10 sm:p-16 flex flex-col items-center bg-gradient-to-b from-stone-900 to-black">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-red-600/20 blur-2xl animate-pulse" />
                  <FaVolumeUp className="text-red-500 text-6xl relative z-10" />
                </div>
                <audio 
                  controls 
                  src={pedido.conteudo?.audio_url} 
                  className="w-full h-12 accent-red-600" 
                  autoPlay 
                />
                <p className="mt-6 text-stone-500 text-[10px] font-bold uppercase tracking-[0.3em]">Mensagem em áudio</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RODAPÉ */}
      <div className="mt-12 text-center px-8">
        <p className="text-[9px] text-stone-500/40 uppercase leading-relaxed tracking-wider max-w-xs mx-auto">
          Presente digital exclusivo. O conteúdo será <br/> desativado em breve por motivos de privacidade.
        </p>
      </div>
      
      {/* ESTILOS GLOBAIS DE PÁGINA */}
      <style jsx global>{`
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}