// app/pagamento/components/CreditCardPaymentSection.tsx
import { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface CreditCardPaymentSectionProps {
  cartTotal: number;
}

export default function CreditCardPaymentSection({ cartTotal }: CreditCardPaymentSectionProps) {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardFormError, setCardFormError] = useState<string | null>(null);
  const [cardPaymentSuccess, setCardPaymentSuccess] = useState(false);

  if (cardPaymentSuccess) {
    return (
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckIcon className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Pagamento aprovado!</h3>
        <p className="mt-2 text-gray-600">
          Seu pagamento de{' '}
          <span className="font-bold">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>{' '}
          foi processado com sucesso.
        </p>
        <button
          onClick={() => router.push('/sucesso')}
          className="mt-4 text-rose-600 font-medium hover:underline"
        >
          Ver comprovante
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-1">
          Número do cartão
        </label>
        <input
          id="card-number"
          type="text"
          inputMode="numeric"
          value={cardNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 16);
            const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
            setCardNumber(formatted);
            if (cardFormError) setCardFormError(null);
          }}
          placeholder="0000 0000 0000 0000"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          maxLength={19}
        />
      </div>

      <div>
        <label htmlFor="card-name" className="block text-sm font-medium text-gray-700 mb-1">
          Nome no cartão
        </label>
        <input
          id="card-name"
          type="text"
          value={cardName}
          onChange={(e) => {
            setCardName(e.target.value);
            if (cardFormError) setCardFormError(null);
          }}
          placeholder="Como está no cartão"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
            Validade (MM/AA)
          </label>
          <input
            id="expiry"
            type="text"
            inputMode="numeric"
            value={expiry}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '').slice(0, 4);
              if (value.length >= 2) {
                value = value.replace(/(\d{2})(\d{0,2})/, '$1/$2');
              }
              setExpiry(value);
              if (cardFormError) setCardFormError(null);
            }}
            placeholder="MM/AA"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            maxLength={5}
          />
        </div>
        <div>
          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
            CVV
          </label>
          <input
            id="cvv"
            type="text"
            inputMode="numeric"
            value={cvv}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 3);
              setCvv(value);
              if (cardFormError) setCardFormError(null);
            }}
            placeholder="123"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            maxLength={3}
          />
        </div>
      </div>

      {cardFormError && <p className="text-red-600 text-sm">{cardFormError}</p>}

      <button
        onClick={() => {
          if (!/^\d{4} \d{4} \d{4} \d{4}$/.test(cardNumber)) {
            setCardFormError('Número do cartão inválido.');
            return;
          }
          if (cardName.trim().length < 3) {
            setCardFormError('Nome no cartão inválido.');
            return;
          }
          if (!/^\d{2}\/\d{2}$/.test(expiry)) {
            setCardFormError('Validade inválida. Use MM/AA.');
            return;
          }
          if (cvv.length !== 3) {
            setCardFormError('CVV inválido.');
            return;
          }
          setCardPaymentSuccess(true);
          console.log('Pagamento com cartão simulado:', {
            amount: cartTotal,
            last4: cardNumber.replace(/\s/g, '').slice(-4),
          });
        }}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-red-900 text-white font-semibold rounded-full hover:bg-red-800 shadow-sm transition-all"
                  >
                    Confirmar pagamento
                  </button>
    </div>
  );
}