'use client';

import {
  MicrophoneIcon,
  VideoCameraIcon,
  ArrowUpTrayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';

interface MediaRecorderSectionProps {
  type: 'audio' | 'video';
  onMediaReady: (url: string | null) => void;
}

export default function MediaRecorderSection({
  type,
  onMediaReady,
}: MediaRecorderSectionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [recordTime, setRecordTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const maxDuration = 90; // segundos

  useEffect(() => {
    return () => {
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
  }, [mediaUrl]);

  const startRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      return;
    }

    try {
      const constraints = type === 'audio' ? { audio: true } : { video: true, audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      recordedChunksRef.current = [];
      
      const mimeType = type === 'audio'
        ? (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg')
        : (MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/mp4');

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => e.data.size > 0 && recordedChunksRef.current.push(e.data);

      mediaRecorder.onstop = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setMediaUrl(url);
        onMediaReady(url);
        stream.getTracks().forEach(t => t.stop());
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordTime(0);

      timerRef.current = setInterval(() => {
        setRecordTime((prev) => {
          if (prev >= maxDuration) {
            mediaRecorder.stop();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      alert('Erro ao acessar dispositivos de mídia.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const mediaEl = type === 'audio' ? new Audio(url) : document.createElement('video');

    mediaEl.onloadedmetadata = () => {
      if (mediaEl.duration > maxDuration) {
        alert(`O arquivo excede o limite de ${maxDuration} segundos.`);
        URL.revokeObjectURL(url);
        e.target.value = '';
        return;
      }
      setMediaUrl(url);
      onMediaReady(url);
    };
    mediaEl.src = url;
  };

  const clearMedia = () => {
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    setMediaUrl(null);
    setRecordTime(0);
    recordedChunksRef.current = [];
    onMediaReady(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {!mediaUrl ? (
        <div className="space-y-3">
          {/* Botão de Gravar */}
          <button
            onClick={startRecording}
            className={`w-full flex items-center justify-center font-bold py-4 px-6 rounded-full transition-all ${
              isRecording
                ? 'bg-red-100 text-red-600 border-2 border-red-500 scale-[0.98]'
                : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-indigo-200'
            }`}
          >
            {isRecording ? (
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                </span>
                Parar ({Math.floor(recordTime / 60)}:{(recordTime % 60).toString().padStart(2, '0')})
              </div>
            ) : (
              <>
                {type === 'audio' ? <MicrophoneIcon className="h-6 w-6 mr-2" /> : <VideoCameraIcon className="h-6 w-6 mr-2" />}
                Gravar {type === 'audio' ? 'Áudio' : 'Vídeo'}
              </>
            )}
          </button>

          {/* Barra de Progresso durante gravação */}
          {isRecording && (
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-red-500 h-full transition-all duration-1000 ease-linear"
                style={{ width: `${(recordTime / maxDuration) * 100}%` }}
              />
            </div>
          )}

          {/* Botão de Upload (escondido se estiver gravando) */}
          {!isRecording && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center py-3 px-6 border-2 border-dashed border-gray-300 text-gray-500 rounded-full hover:border-indigo-400 hover:text-indigo-500 transition-colors"
            >
              <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
              Upload de arquivo
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            accept={type === 'audio' ? 'audio/*' : 'video/*'}
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      ) : (
        /* Preview e Opção de Reset */
        <div className="animate-in fade-in zoom-in duration-300">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Preview do {type}</span>
              <span className="text-xs text-green-600 font-medium">Pronto para envio</span>
            </div>
            
            {type === 'audio' ? (
              <audio controls src={mediaUrl} className="w-full" />
            ) : (
              <video controls src={mediaUrl} className="w-full rounded-lg overflow-hidden shadow-inner bg-black" />
            )}

            <button
              onClick={clearMedia}
              className="w-full flex items-center justify-center py-3 text-red-500 font-semibold hover:bg-red-50 rounded-full transition-colors border border-transparent hover:border-red-100"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Remover e tentar novamente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}