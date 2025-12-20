// app/pagamento/components/MimoCardSection.tsx
interface MimoCardSectionProps {
  cartTotal: number;
}

export default function MimoCardSection({ cartTotal }: MimoCardSectionProps) {
  return (
    <div className="max-w-md mx-auto text-center py-8 text-gray-600">
      <p className="text-lg font-medium text-gray-800">Usar Cartão Mimo</p>
      <p className="mt-3 text-gray-700">
        O valor de{' '}
        <span className="font-bold text-gray-900">
          R$ {cartTotal.toFixed(2).replace('.', ',')}
        </span>{' '}
        será descontado diretamente do seu saldo no Cartão Mimo.
      </p>
      <p className="mt-3 text-sm text-gray-500">
        Certifique-se de que seu cartão possui saldo suficiente.
      </p>
                  <button
                    className="w-full mt-2 flex items-center justify-center gap-2
                     p-3 bg-red-900 text-white font-semibold rounded-full hover:bg-red-800 shadow-sm transition-all"
                  >
                    Confirmar pagamento
                  </button>
    </div>
  );
}