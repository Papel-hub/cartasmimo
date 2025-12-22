// app/pagamento/components/PaymentMethodSelector.tsx
import { useRef } from 'react';

type PaymentMethod = 'pix' | 'cartao' | 'boleto' | '';

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  const selectRef = useRef<HTMLSelectElement>(null);

  return (
    <div className="max-w-md mx-auto mb-3">
      <div className="relative">
        <label htmlFor="pagamento" className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de pagamento
        </label>
        <select
          id="metodo-pagamento"
          ref={selectRef}
          value={value}
          onChange={(e) => onChange(e.target.value as PaymentMethod)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-900"
          >
          <option value="">Selecione o tipo</option>
          <option value="pix">PIX</option>
          <option value="cartao">Cartão de Crédito</option>
          <option value="boleto">Boleto</option>
        </select>
      </div>

    </div>
  );
}