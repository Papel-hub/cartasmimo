import { Dispatch, SetStateAction } from 'react';

type TipoEntrega = 'digital' | 'fisica' | 'ambos';

export default function EntregaTypeSection({
  tipoEntrega,
  setTipoEntrega,
}: {
  tipoEntrega: TipoEntrega;
  setTipoEntrega: Dispatch<SetStateAction<TipoEntrega>>;
}) {
  return (
    <section className="mb-6">
      <h2 className="text-sm font-medium text-gray-600 mb-3">Escolha o tipo de entrega</h2>
      <div className="space-y-3">
        {[
          { value: 'digital', label: 'Entrega digital', detail: '(Prazo 24h)' },
          { value: 'fisica', label: 'Entrega física', detail: '(Prazo de 10 dias úteis)' },
          { value: 'ambos', label: 'Ambos', detail: '' },
        ].map((opt) => (
          <label
            key={opt.value}
            className="flex items-center p-3 rounded-lg border border-gray-300 space-x-3 cursor-pointer"
          >
            <input
              type="radio"
              name="entrega"
              value={opt.value}
              checked={tipoEntrega === opt.value}
              onChange={(e) => setTipoEntrega(e.target.value as TipoEntrega)}
              className="h-4 w-4 accent-red-900 focus:ring-red-800"
            />
            <span className="text-gray-800">
              {opt.label} {opt.detail && <span className="text-gray-400">{opt.detail}</span>}
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}