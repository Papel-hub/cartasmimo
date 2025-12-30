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


// Tipagem local para o estado do pedido
interface PedidoData {
  conteudo?: {
    de?: string;
    para?: string;
    texto?: string;
    audio_url?: string | null;
    video_url?: string | null;
  };
}

// 1. Altere a interface para refletir que params é uma Promise
type PageProps = {
  params: Promise<{ id: string }>;
};

export default function PresenteCliente({ params }: PageProps) {
  // Use React.use() ou simplesmente extraia o ID em um useEffect
  const [pedido, setPedido] = useState<PedidoData | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [step, setStep] = useState<number>(0); // 0: Capa, 1: Mensagem, 2: Mídia, 3: Final
  const [loading, setLoading] = useState<boolean>(true);
  const [activeModal, setActiveModal] = useState<'video' | 'audio' | null>(null);

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
    <div className="min-h-screen bg-stone-500 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-red-900"></div>
    </div>
  );

  if (!pedido) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-500">
      <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-stone-200">
        <FaInfoCircle className="mx-auto text-stone-300 mb-4 text-3xl" />
        <p className="font-sans font-bold text-stone-600">Presente não encontrado ou expirado.</p>
      </div>
    </div>
  );

  const temMidia = !!(pedido.conteudo?.audio_url || pedido.conteudo?.video_url);

  return (
    <div className="min-h-[100dvh] bg-stone-500 flex flex-col items-center justify-center p-4 overflow-hidden relative selection:bg-red-100">

      {/* CONTAINER DO CARTÃO INTERATIVO */}
      <div className="relative w-full max-w-[340px] h-[480px] sm:h-[520px] perspective-1000">
        
        {/* PÁGINA 4: FINALIZAÇÃO */}
        <div 
          className={`absolute inset-0 transition-all bg-stone-500 duration-1000 rounded-lg overflow-hidden shadow-2xl z-10
            ${step === 3 ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-90 pointer-events-none'}`}
        >
          <Image src="/images/carta4.svg" alt="Fim" fill className="object-cover" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/5">
              <p className="text-stone-800 mb-2 font-serif text-white/70 italic text-sm">
                Esperamos que tenha gostado!
              </p>                 
              <button 
                  onClick={() => setStep(0)}
                  className="flex items-center gap-3 mx-auto bg-white text-black px-8 py-3 rounded-full text-xs font-black tracking-widest active:scale-95 transition-all hover:bg-red-900 shadow-lg"
                >
                  <FaUndo size={12} /> REVER
                </button>  
                        <div className="absolute top-[66%] overflow-hidden">
                          <Image
                          src="/images/qrcode.png"
                          alt="Cartão"
                          width={70}
                          height={70}
                          className="object-contain w-full max-w-xs"
                        />
                        </div>
          
          </div>
        </div>

{/* PÁGINA 3: MÍDIA (ÁUDIO/VÍDEO) */}
<div 
  className={`absolute inset-0 transition-all duration-700 rounded-lg overflow-hidden shadow-xl z-20 border-l border-stone-200 bg-stone-500
    ${step === 2 ? 'opacity-100 translate-x-0 rotate-0' : step > 2 ? '-translate-x-full opacity-0' : 'translate-x-10 opacity-0 pointer-events-none'}`}
  onClick={() => setStep(3)}
>
  <Image src="/images/carta3.svg" alt="Mídia" fill className="object-cover" />
  
  <div className="absolute inset-0 flex flex-col items-center top-[20%] px-8 space-y-5">
    {/* Título da Seção - Sempre visível */}
    <div className="text-center mb-2">
      <div className="h-px w-12 bg-stone-300 mx-auto mb-4" />
      <p className="text-[11px] text-white/70 font-black uppercase tracking-[0.2em]">Conteúdo Digital</p>
    </div>

    {/* Lógica dos Botões */}
    {temMidia ? (
      <>
        {/* Botão de Áudio: Só aparece se existir audio_url */}
        {pedido.conteudo?.audio_url && (
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveModal('audio'); }} 
            className="w-full bg-white/95 p-5 rounded-2xl border border-stone-100 font-bold text-xs flex items-center justify-between gap-4 shadow-xl hover:bg-stone-50 transition-colors"
          >
            <span className="flex items-center gap-3 text-stone-700">
              <FaVolumeUp className="text-red-700" size={18} /> OUVIR MENSAGEM
            </span>
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </button>
        )}
        
        {/* Botão de Vídeo: Só aparece se existir video_url */}
        {pedido.conteudo?.video_url && (
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveModal('video'); }} 
            className="w-full bg-stone-900 p-5 rounded-2xl font-bold text-xs flex items-center justify-between gap-4 shadow-xl text-white hover:bg-stone-800 transition-colors"
          >
            <span className="flex items-center gap-3">
              <FaPlay className="text-red-500" size={16} /> VER VÍDEO ESPECIAL
            </span>
            <FaPlay className="opacity-20" size={12} />
          </button>
        )}
      </>
    ) : (
      /* Caso não tenha NENHUMA mídia */
      <div className="w-full py-10 flex flex-col items-center justify-center border-2 border-dashed border-white/70 rounded-3xl">
                   <div className="text-center opacity-30">
                      <FaInfoCircle className="text-white/70 mx-auto mb-2 text-xl" />
                      <p className="text-[10px] text-white/70 italic">Sem mídia disponível.</p>
                   </div>
      </div>
    )}

    {/* Instrução de Navegação - Sempre visível no rodapé da carta */}
    <p className="text-[10px] text-stone-400 absolute bottom-12 font-medium">Toque para finalizar</p>
  </div>
</div>

        {/* PÁGINA 2: MENSAGEM TEXTUAL */}
        <div 
          className={`absolute inset-0 transition-all duration-700 rounded-lg overflow-hidden shadow-xl z-30 border-l border-stone-100 bg-stone-500
            ${step === 1 ? 'opacity-100 translate-x-0' : step > 1 ? '-translate-x-full opacity-0' : 'translate-x-10 opacity-0 pointer-events-none'}`}
          onClick={() => setStep(2)}
        >
          <Image src="/images/carta2.svg" alt="Texto" fill className="object-cover" />
          <div className="relative p-10 h-full flex flex-col">
               {/* Posicionamentos baseados na sua arte carta2.svg */}
               <div className="absolute top-[49.5%] left-[25%] w-[50%] text-[14px] font-bold text-gray-800 truncate">
                 {pedido.conteudo?.de}
               </div>
               <div className="absolute top-[54.5%] left-[28%] w-[50%] text-[14px] font-bold text-gray-800 truncate">
                 {pedido.conteudo?.para}
               </div>
               
               <div className="absolute top-[64%] left-[18%] w-[65%] h-[20%] text-[12px] text-gray-700 font-serif leading-relaxed italic overflow-y-auto pr-2 custom-scrollbar">
                  {pedido.conteudo?.texto}
               </div>

               <div className="absolute bottom-10 left-0 w-full text-center">
                 <p className="text-[9px] text-stone-400 animate-pulse uppercase font-black tracking-[0.2em]">
                   {temMidia ? 'Ver surpresa digital' : 'Toque para continuar'}
                 </p>
               </div>
          </div>
        </div>

        {/* PÁGINA 1: CAPA (FRONTAL) */}
        <div 
          className={`absolute inset-0 transition-all duration-1000 rounded-lg overflow-hidden shadow-2xl z-40 cursor-pointer group
            ${step === 0 ? 'opacity-100 scale-100' : '-translate-x-full opacity-0 pointer-events-none'}`}
          onClick={() => setStep(1)}
        >
          <Image src="/images/carta1.svg" alt="Capa" fill className="object-cover" priority />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 transition-colors ">
             <div className="mt-24 space-y-2">
                 <p className="text-white font-serif italic text-sm opacity-80">Especialmente para:</p>
                 <p className="text-white font-black italic text-xl uppercase tracking-[0.25em] drop-shadow-lg">
                   {pedido.conteudo?.para}
                 </p>
             </div>
             <div className="absolute bottom-16 flex flex-col items-center gap-2">
               <p className="text-white/60 text-[10px] tracking-[0.3em] uppercase animate-bounce font-bold">
               Toque para abrir</p>
             </div>
          </div>
        </div>

      </div>

      {/* MODAL DE MÍDIA (MODERNIZADO) */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] bg-stone-950/95 flex items-center justify-center p-6 backdrop-blur-xl">
          <button 
            onClick={() => setActiveModal(null)} 
            className="absolute top-8 right-8 text-white/50 hover:text-white text-4xl p-2 transition-colors"
          >
            <FaTimes />
          </button>
          
          <div className="w-full max-w-2xl bg-black rounded-3xl overflow-hidden border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            {activeModal === 'video' ? (
              <div className="aspect-video w-full">
                <iframe 
                  src={pedido.conteudo?.video_url ?? ''} 
                  className="w-full h-full" 
                  allow="autoplay; fullscreen" 
                  title="Video Presente"
                />
              </div>
            ) : (
              <div className="p-16 flex flex-col items-center bg-gradient-to-b from-stone-900 to-black">
                <div className="relative mb-10">
                  <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
                  <FaVolumeUp className="text-red-500 text-6xl relative animate-pulse" />
                </div>
                <audio 
                  controls 
                  src={pedido.conteudo?.audio_url ?? ''} 
                  className="w-full h-12 accent-red-600" 
                  autoPlay 
                />
                <p className="mt-8 text-stone-500 text-[10px] uppercase tracking-widest font-bold">Mensagem em áudio</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-12 text-center px-8">
        <p className="text-[9px] text-white uppercase leading-relaxed tracking-wider max-w-xs mx-auto">
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