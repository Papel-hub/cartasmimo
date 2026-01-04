import { Dispatch, SetStateAction } from 'react';
import {
  DevicePhoneMobileIcon,
  TruckIcon, // Corrigido de 'car' para 'TruckIcon'
  SparklesIcon,
} from '@heroicons/react/24/outline';

type TipoEntrega = 'digital' | 'fisica' | 'ambos';

export default function EntregaTypeSection({
  tipoEntrega,
}: {
  tipoEntrega: TipoEntrega;
  setTipoEntrega: Dispatch<SetStateAction<TipoEntrega>>;
}) {
  const opcoes = [
    { 
      value: 'digital', 
      label: 'Entrega Digital', 
      detail: '(Envio em até 24h)', 
      Icon: DevicePhoneMobileIcon 
    },
    { 
      value: 'fisica', 
      label: 'Entrega Física', 
      detail: '(Prazo de 10 dias úteis)', 
      Icon: TruckIcon 
    },
    { 
      value: 'ambos', 
      label: 'Entrega Digital + Física', 
      detail: '(Completo)', 
      Icon: SparklesIcon 
    },
  ];

  // Filtra para exibir apenas o que foi selecionado na Home
  const opcaoSelecionada = opcoes.find((opt) => opt.value === tipoEntrega);

  if (!opcaoSelecionada) return null;

  // Extraímos o componente de ícone com letra maiúscula para o React reconhecer
  const { Icon } = opcaoSelecionada;

  return (
    <section className="mb-6">
      <h2 className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-[0.15em]">
        Formato de Entrega Definido
      </h2>
      
      <div className="flex items-center p-4 rounded-xl border-2 border-red-900 bg-red-50/50 space-x-4 shadow-sm">
        <div className="flex-shrink-0">
          <Icon className="w-8 h-8 text-red-900" aria-hidden="true" />
        </div>
        
        <div className="flex flex-col">
          <span className="text-red-900 font-bold text-base leading-tight">
            {opcaoSelecionada.label}
          </span>
          <span className="text-[11px] text-red-700 font-medium">
            {opcaoSelecionada.detail}
          </span>
        </div>
        
        <div className="ml-auto">
          <div className="bg-red-900 rounded-full p-1">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 mt-2 italic">
        * O tipo de entrega é definido pelo formato escolhido na página inicial.
      </p>
    </section>
  );
}