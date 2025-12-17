// app/pagamento/components/PixPaymentSection.tsx
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

  const isUserLoggedIn = email && validateEmail(email);

  return (
    <div className="max-w-md mx-auto space-y-6">
      {!isUserLoggedIn && (
        <EmailInput
          value={email}
          onChange={onEmailChange}
          error={emailError}
          setError={setEmailError}
        />
      )}

      {!qrCode ? (
        <div className="text-center">
          <button
            onClick={handleGenerate}
            disabled={loading || (email.trim() === '' && !isUserLoggedIn) || (!isUserLoggedIn && !validateEmail(email))}
            className="w-full bg-green-800 text-white py-3 px-6 rounded-full font-medium hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Gerando QR Code...' : 'Gerar pagamento PIX'}
          </button>
          <p className="text-xs text-gray-500 mt-3">
            Após o pagamento, você receberá um e-mail de confirmação.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <p className="font-medium text-gray-800 mb-3">Escaneie o QR Code</p>
            <Image 
              src={qrCode}
              width={200} 
              height={200}
              alt="QR Code para pagamento PIX"
              className="w-64 h-64 mx-auto border rounded-lg shadow-sm bg-white p-2"
            />
            <p className="text-sm text-gray-500 mt-1">Validade: 2h</p>
          </div>

          {pixKey && (
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">Ou copie a chave PIX abaixo:</p>
              <div className="relative max-w-xs mx-auto">
                <input
                  readOnly
                  value={pixKey}
                  className="w-full p-3 pl-4 pr-10 border rounded-lg bg-gray-50 text-sm font-mono truncate"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label="Copiar chave PIX"
                >
                  {copied ? (
                    <CheckIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <ClipboardIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}