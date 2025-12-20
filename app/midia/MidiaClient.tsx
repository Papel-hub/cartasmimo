'use client';

import {
  MicrophoneIcon,
  VideoCameraIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { use } from 'react';

// =======================
// 🎙️ Componente reutilizável de mídia (com limite 90s)
// ======================= 
function MediaRecorderSection({
  type,
  onMediaReady,
}: {
  type: 'audio' | 'video';
  onMediaReady: (url: string) => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [recordTime, setRecordTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const maxDuration = 90; // segundos

  const startRecording = async () => {
    if (isRecording) {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      }
      return;
    }

    try {
      const constraints =
        type === 'audio' ? { audio: true } : { video: true, audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      recordedChunksRef.current = [];
      const mimeType =
        type === 'audio'
          ? MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : 'audio/ogg'
          : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : MediaRecorder.isTypeSupported('video/webm')
          ? 'video/webm'
          : 'video/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setRecordTime(0);
        const blob = new Blob(recordedChunksRef.current, {
          type: type === 'audio' ? 'audio/webm' : 'video/webm',
        });
        const url = URL.createObjectURL(blob);
        setMediaUrl(url);
        onMediaReady(url);
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordTime(0);

      // ⏱️ Atualiza contador e para aos 90s
      timerRef.current = setInterval(() => {
        setRecordTime((prev) => {
          if (prev >= maxDuration) {
            mediaRecorder.stop();
            alert('O tempo máximo de gravação (90 segundos) foi atingido.');
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error(`Erro ao acessar ${type}:`, err);
      alert(
        `Não foi possível acessar o ${
          type === 'audio' ? 'microfone' : 'câmera/microfone'
        }. Verifique as permissões.`
      );
    }
  };

  // 🧩 Verifica duração do arquivo antes de aceitar
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const mediaEl =
      type === 'audio'
        ? new Audio(url)
        : document.createElement('video');

    mediaEl.src = url;
    mediaEl.onloadedmetadata = () => {
      const duration = mediaEl.duration;
      if (duration > maxDuration) {
        alert(
          `O ${type === 'audio' ? 'áudio' : 'vídeo'} excede o limite de 90 segundos.`
        );
        URL.revokeObjectURL(url);
        e.target.value = ''; // limpa input
        return;
      }
      setMediaUrl(url);
      onMediaReady(url);
    };
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-4">
      <button
        onClick={startRecording}
        className={`w-full flex items-center justify-center font-medium py-3 px-4 rounded-full transition ${
          isRecording
            ? 'bg-red-50 text-red-700 border border-red-500'
            : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        {isRecording ? (
          <>
            <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse mr-2" />
            Parar {type === 'audio' ? 'Gravação de Áudio' : 'Gravação de Vídeo'}
          </>
        ) : (
          <>
            {type === 'audio' ? (
              <MicrophoneIcon className="h-5 w-5 mr-2" />
            ) : (
              <VideoCameraIcon className="h-5 w-5 mr-2" />
            )}
            {type === 'audio' ? 'Gravar Áudio' : 'Gravar Vídeo'}
          </>
        )}
      </button>

      {isRecording && (
        <div className="text-center text-sm text-gray-600">
          ⏱️ {formatTime(recordTime)} / 01:30
        </div>
      )}

      <button
        onClick={triggerFileUpload}
        className="w-full flex items-center justify-center border border-gray-300 font-medium py-3 px-4 rounded-full transition hover:bg-gray-50"
      >
        <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
        Carregar do Dispositivo
      </button>
      <input
        type="file"
        ref={fileInputRef}
        accept={type === 'audio' ? 'audio/*' : 'video/*'}
        onChange={handleFileUpload}
        className="hidden"
      />

      {mediaUrl && (
        <div className="mt-2">
          <p className="text-sm text-gray-600 mb-2">
            {type === 'audio' ? 'Áudio selecionado:' : 'Vídeo selecionado:'}
          </p>
          {type === 'audio' ? (
            <audio controls src={mediaUrl} className="w-full" />
          ) : (
            <video controls src={mediaUrl} className="w-full rounded" />
          )}
        </div>
      )}
    </div>
  );
}


// =======================
// 📦 Página principal
// =======================
export default function MidiaClient({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const resolvedParams = use(searchParams);
  const tipo = resolvedParams.tipo;

  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (tipo !== 'audio' && tipo !== 'video' && tipo !== 'both') {
      setError('Tipo de mídia inválido.');
    }
  }, [tipo]);

  const handleAudioReady = (url: string) => {
    setAudioUrl(url);
    localStorage.setItem('mimo_midia_audio', url);
  };

  const handleVideoReady = (url: string) => {
    setVideoUrl(url);
    localStorage.setItem('mimo_midia_video', url);
  };

  const handleContinue = () => {
    if (tipo === 'both') {
      if (!audioUrl || !videoUrl) {
        alert('Por favor, envie ou grave tanto o áudio quanto o vídeo.');
        return;
      }
    }
    router.push('/entrega');
  };

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4 text-red-600">
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
      <main className="flex-grow sm:px-16 px-8 pt-24 pb-12">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6 space-y-6">
          {tipo === 'both' ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 text-center">
                Mensagem Completa (Áudio + Vídeo)
              </h1>
              <p className="text-gray-600 text-center">
                Grave ou envie sua mensagem de áudio e vídeo personalizados
              </p>

              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Mensagem de Áudio
                  </h2>
                  <MediaRecorderSection type="audio" onMediaReady={handleAudioReady} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Mensagem em Vídeo
                  </h2>
                  <MediaRecorderSection type="video" onMediaReady={handleVideoReady} />
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 text-center">
                {tipo === 'audio' ? 'Mensagem de Áudio' : 'Mensagem em Vídeo'}
              </h1>
              <p className="text-gray-600 text-center">
                {tipo === 'audio'
                  ? 'Grave ou envie uma mensagem de áudio personalizada'
                  : 'Grave ou envie um vídeo com sua mensagem personalizada'}
              </p>
              <MediaRecorderSection
                type={tipo as 'audio' | 'video'}
                onMediaReady={(url) =>
                  tipo === 'audio' ? handleAudioReady(url) : handleVideoReady(url)
                }
              />
            </>
          )}

          <button
            onClick={handleContinue}
            className="w-full py-3 px-4 bg-red-900 text-white font-medium rounded-full hover:bg-red-800 transition"
          >
            Continuar para entrega
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
