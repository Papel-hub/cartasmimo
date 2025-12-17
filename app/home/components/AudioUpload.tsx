'use client';
import React, { useState, useEffect } from 'react';
import { FormatoTipo } from './FormatoSelector';

interface Props {
  audioFile: File | null;
  setAudioFile: (file: File | null) => void;
  selectedFormat: FormatoTipo;
}

export default function AudioUpload({ audioFile, setAudioFile, selectedFormat }: Props) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFormat.includes('digital')) {
      setAudioFile(null);
      if (audioFile) {
        setError('O upload de música só é permitido para cartões digitais.');
      }
    } else {
      setError(null);
    }
  }, [selectedFormat]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);

    if (!selectedFormat.includes('digital')) {
      setError('O upload de música só é permitido para cartões digitais.');
      setAudioFile(null);
      e.target.value = '';
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/aiff', 'audio/flac', 'audio/aac'];
    if (!validTypes.includes(file.type)) {
      setError('Formato inválido. Use MP3, WAV, AIFF, FLAC ou AAC.');
      setAudioFile(null);
      e.target.value = '';
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const audio = document.createElement('audio');
    audio.src = objectUrl;
    audio.preload = 'metadata';

    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl); // limpa o URL temporário

      if (isNaN(audio.duration)) {
        setError('Erro ao verificar a duração do áudio.');
        setAudioFile(null);
        e.target.value = '';
        return;
      }

      if (audio.duration > 90) {
        alert('A música deve ter no máximo 90 segundos.');
        setAudioFile(null);
        e.target.value = '';
      } else {
        setAudioFile(file);
      }
    };

    audio.onerror = () => {
      setError('Erro ao carregar o arquivo de áudio.');
      setAudioFile(null);
      e.target.value = '';
      URL.revokeObjectURL(objectUrl);
    };
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Adicionar música (opcional)
      </label>
      <input
        type="file"
        accept=".mp3,.wav,.aiff,.flac,.aac"
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
      />

      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      {audioFile && !error && (
        <p className="text-green-600 text-sm mt-1">
          Arquivo selecionado: {audioFile.name}
        </p>
      )}
    </div>
  );
}
