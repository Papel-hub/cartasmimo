// app/pagamento/components/BoletoPaymentSection.tsx
import { useState } from 'react';
import EmailInput from './EmailInput';

interface BoletoPaymentSectionProps {
  email: string;
  onEmailChange: (email: string) => void;
  onGenerateBoleto: (boletoData: {
    first_name: string;
    last_name: string;
    identification: { type: string; number: string };
  }) => Promise<void>;
  loading: boolean;
  boletoUrl: string | null;
}

export default function BoletoPaymentSection({
  email,
  onEmailChange,
  onGenerateBoleto,
  loading,
  boletoUrl,
}: BoletoPaymentSectionProps) {
  const [emailError, setEmailError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [docType, setDocType] = useState<'CPF' | 'CNPJ'>('CPF');
  const [docNumber, setDocNumber] = useState('');

  const validateEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateDoc = (type: string, number: string): boolean => {
    const clean = number.replace(/\D/g, '');
    if (type === 'CPF') return clean.length === 11;
    if (type === 'CNPJ') return clean.length === 14;
    return false;
  };

  const handleGenerate = async () => {
    if (!validateEmail(email)) {
      setEmailError('Por favor, insira um e-mail válido.');
      return;
    }
    setEmailError(null);

    if (!firstName.trim() || !lastName.trim()) {
      alert('Nome e sobrenome são obrigatórios.');
      return;
    }

    if (!validateDoc(docType, docNumber)) {
      alert(`Documento inválido para ${docType}.`);
      return;
    }

    await onGenerateBoleto({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      identification: {
        type: docType,
        number: docNumber.replace(/\D/g, ''),
      },
    });
  };

  if (boletoUrl) {
    return (
      <div className="max-w-md mx-auto text-center py-8">
        <p className="text-lg mb-3">🧾 Seu boleto foi gerado!</p>
        <a
          href={boletoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-rose-600 text-white py-3 px-6 rounded-full font-medium hover:bg-rose-700 transition-colors"
        >
          Abrir Boleto
        </a>
        <p className="text-xs text-gray-500 mt-3">
          Imprima ou salve o boleto. O pagamento pode levar até 3 dias úteis para compensar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!email && (
        <EmailInput
          value={email}
          onChange={onEmailChange}
          error={emailError}
          setError={setEmailError}
          label="Seu e-mail"
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="João"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="Silva"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Documento</label>
        <div className="flex gap-2">
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as 'CPF' | 'CNPJ')}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="CPF">CPF</option>
            <option value="CNPJ">CNPJ</option>
          </select>
          <input
            type="text"
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
            placeholder={docType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
            className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-red-900 text-white py-3 px-6 rounded-full font-medium hover:bg-red-800 disabled:opacity-60"
      >
        {loading ? 'Gerando boleto...' : 'Gerar boleto'}
      </button>
    </div>
  );
}