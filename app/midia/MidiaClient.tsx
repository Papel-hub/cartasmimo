'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import MediaRecorderSection from './MediaRecorderSection';

/* =========================
   TIPAGEM
========================= */

interface MidiaClientProps {
  searchParams: Promise<{ tipo?: string }>;
}

interface UploadResponse {
  success: boolean;
  audioPath: string | null;
  videoPath: string | null;
  error?: string;
}

export default function MidiaClient({ searchParams }: MidiaClientProps) {
  // Resolve os params usando o hook 'use' conforme padrão do Next.js 15
  const resolvedParams = use(searchParams);
  const tipo = resolvedParams.tipo;

  const router = useRouter();
  
  // Estados Tipados
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // 1. Efeito para validação e carregamento inicial
  useEffect(() => {
    const validTypes = ['audio', 'video', 'both'];
    if (tipo && !validTypes.includes(tipo)) {
      setError('Tipo de mídia inválido.');
      return;
    }

    const savedAudio = localStorage.getItem('mimo_midia_audio');
    const savedVideo = localStorage.getItem('mimo_midia_video');

    if (savedAudio) setAudioUrl(savedAudio);
    if (savedVideo) setVideoUrl(savedVideo);
  }, [tipo]);

  const handleAudioReady = (url: string | null): void => {
    setAudioUrl(url);
    if (url) {
      localStorage.setItem('mimo_midia_audio', url);
    } else {
      localStorage.removeItem('mimo_midia_audio');
    }
  };

  const handleVideoReady = (url: string | null): void => {
    setVideoUrl(url);
    if (url) {
      localStorage.setItem('mimo_midia_video', url);
    } else {
      localStorage.removeItem('mimo_midia_video');
    }
  };

  const isReadyToContinue = (): boolean => {
    if (tipo === 'both') return !!audioUrl && !!videoUrl;
    if (tipo === 'audio') return !!audioUrl;
    if (tipo === 'video') return !!videoUrl;
    return false;
  };

  /* =========================
     LÓGICA DE UPLOAD
  ========================= */

  const handleContinue = async (): Promise<void> => {
    if (!isReadyToContinue() || isUploading) return;

    setIsUploading(true);

    try {
      const formData = new FormData();

      // Função auxiliar para converter blob URL em File/Blob real
      const fetchBlob = async (url: string): Promise<Blob> => {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Falha ao processar arquivo local.');
        return await res.blob();
      };

      if (audioUrl && (tipo === 'audio' || tipo === 'both')) {
        const audioBlob = await fetchBlob(audioUrl);
        formData.append('audio', audioBlob, 'audio.webm');
      }

      if (videoUrl && (tipo === 'video' || tipo === 'both')) {
        const videoBlob = await fetchBlob(videoUrl);
        formData.append('video', videoBlob, 'video.webm');
      }

      const response = await fetch('/api/upload-midia', {
        method: 'POST',
        body: formData,
      });

      const result: UploadResponse = await response.json();

      if (response.ok && result.success) {
        // Armazena as URLs finais retornadas pelo servidor
        if (result.audioPath) localStorage.setItem('mimo_final_audio', result.audioPath);
        if (result.videoPath) localStorage.setItem('mimo_final_video', result.videoPath);
        
        router.push('/entrega');
      } else {
        throw new Error(result.error || 'Erro ao enviar arquivos.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Upload error:', message);
      alert('Houve um problema: ' + message);
    } finally {
      setIsUploading(false);
    }
  };

  /* =========================
     RENDERIZAÇÃO
  ========================= */

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4 text-red-600 font-medium">
          {error}
        </main>
        <Footer />
      </div>
    );
  }

  if (!tipo) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow sm:px-16 px-6 pt-28 pb-12">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8">
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-gray-900">
              {tipo === 'both' ? 'Mensagem Completa' : 
               tipo === 'audio' ? 'Mensagem de Áudio' : 'Mensagem em Vídeo'}
            </h1>
            <p className="text-gray-500 max-w-md mx-auto">
              {tipo === 'both' 
                ? 'Grave ou envie seu áudio e vídeo para personalizar seu presente.' 
                : `Grave ou envie sua mensagem de ${tipo === 'audio' ? 'voz' : 'vídeo'} personalizada.`}
            </p>
          </div>

          <div className="space-y-10">
            {/* Seção de Áudio */}
            {(tipo === 'audio' || tipo === 'both') && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-8 h-px bg-gray-200"></span>
                  1. Mensagem de Áudio
                </h2>
                <MediaRecorderSection type="audio" onMediaReady={handleAudioReady} />
              </div>
            )}

            {/* Seção de Vídeo */}
            {(tipo === 'video' || tipo === 'both') && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-8 h-px bg-gray-200"></span>
                  {tipo === 'both' ? '2. Mensagem em Vídeo' : '1. Mensagem em Vídeo'}
                </h2>
                <MediaRecorderSection type="video" onMediaReady={handleVideoReady} />
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-50">
            <button
              onClick={handleContinue}
              disabled={!isReadyToContinue() || isUploading}
              className={`w-full py-4 px-6 rounded-full font-bold transition-all transform active:scale-95 flex justify-center items-center ${
                isReadyToContinue() && !isUploading
                  ? 'bg-red-900 text-white hover:bg-red-800 shadow-xl shadow-red-100'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                  Enviando mídias...
                </div>
              ) : (
                'Continuar para Entrega'
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
              Ao continuar, suas mídias serão salvas permanentemente em nossos servidores.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}