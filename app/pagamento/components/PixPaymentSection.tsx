// app/pagamento/components/PixPaymentSection.tsx
'use client';

import { useState } from 'react';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import EmailInput from './EmailInput';
import Image from 'next/image';

interface PixPaymentSectionProps {
  email: string;
  onEmailChange: (email: string) => void;
  onGeneratePix: () => Promise<void>;
  loading: boolean;
  qrCode: string | null;
  pixKey: string | null;
}

export default function PixPaymentSection({
  email,
  onEmailChange,
  onGeneratePix,
  loading,
  qrCode,
  pixKey,
}: PixPaymentSectionProps) {
  const [emailError, setEmailError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Validação simples de e-mail
  const validateEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleGenerate = async () => {
    if (!validateEmail(email)) {
      setEmailError('Por favor, insira um e-mail válido.');
      return;
    }
    setEmailError(null);
    await onGeneratePix();
  };

  const copyToClipboard = async () => {
    if (!pixKey) return;
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert('❌ Não foi possível copiar a chave.');
    }
  };

  // Lógica corrigida: O input de e-mail aparece apenas se NÃO houver um QR Code gerado
  const showForm = !qrCode;

  return (
    <div className="max-w-md mx-auto space-y-6">
      {showForm ? (
        /* SEÇÃO DE ENTRADA DE DADOS */
        <div className="space-y-6 animate-in fade-in duration-300">
          <EmailInput
            value={email}
            onChange={onEmailChange}
            error={emailError}
            setError={setEmailError}
          />

          <div className="text-center">
            <button
              onClick={handleGenerate}
              disabled={loading || !validateEmail(email)}
              className="w-full bg-green-800 text-white py-3 px-6 rounded-full font-medium hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Gerando QR Code...
                </span>
              ) : (
                'Gerar pagamento PIX'
              )}
            </button>
            <p className="text-xs text-gray-500 mt-3">
              Após o pagamento, você receberá um e-mail de confirmação.
            </p>
          </div>
        </div>
      ) : (
        /* SEÇÃO DO PAGAMENTO GERADO */
        <div className="space-y-6 animate-in zoom-in-95 fade-in duration-500">
          <div className="text-center">
            <div className="inline-block p-2 bg-green-100 text-green-800 rounded-full text-xs font-bold px-3 mb-4">
              PIX AGUARDANDO PAGAMENTO
            </div>
            <p className="font-medium text-gray-800 mb-3">Escaneie o QR Code abaixo:</p>
            
            <div className="relative inline-block border-4 border-white shadow-xl rounded-xl overflow-hidden bg-white p-2">
              <Image 
                src={qrCode}
                width={250} 
                height={250}
                alt="QR Code para pagamento PIX"
                className="w-64 h-64 mx-auto"
                priority
              />
            </div>
            <p className="text-sm text-gray-500 mt-3">Validade: 2 horas</p>
          </div>

          {pixKey && (
            <div className="text-center space-y-3 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
              <p className="text-sm text-gray-600 font-medium">Ou copie a chave PIX abaixo:</p>
              <div className="relative max-w-xs mx-auto">
                <input
                  readOnly
                  value={pixKey}
                  className="w-full p-3 pl-4 pr-12 border rounded-lg bg-white text-xs font-mono truncate focus:ring-2 focus:ring-green-500 outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-green-600 transition-colors"
                  title="Copiar chave"
                >
                  {copied ? (
                    <CheckIcon className="h-6 w-6 text-green-600" />
                  ) : (
                    <ClipboardIcon className="h-6 w-6" />
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">
                  Código copiado!
                </p>
              )}
            </div>
          )}
          
          <button 
            onClick={() => window.location.reload()} 
            className="w-full text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Usar outro e-mail
          </button>
        </div>
      )}
    </div>
  );
}