import { useEffect, useState } from "react";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

type Props = {
  method: 'correios' | 'local' | 'taxi' | null;
  endereco: string;
  setEndereco: (v: string) => void;
  cpe: string;
  setCpe: (v: string) => void;
};

interface FreteResponse {
  valor: number;
  valorFormatado: string;
  prazo: string;
  servico?: string;
  error?: string;
}

export default function FisicaFields({ method, endereco, setEndereco, cpe, setCpe }: Props) {
  const [freteInfo, setFreteInfo] = useState<FreteResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Formatações auxiliares para o modo Correios
  const formatarCEP = (v: string) => v.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").slice(0, 9);

  useEffect(() => {
    if (method !== 'correios') {
      localStorage.setItem("valor_frete", "0");
      localStorage.setItem("prazo_frete", "A combinar");
      setFreteInfo(null);
      return;
    }

    const cepLimpo = cpe.replace(/\D/g, "");
    if (cepLimpo.length === 8) {
      calcular(cepLimpo);
    }
  }, [cpe, method]);

  const calcular = async (cep: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/correios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cepDestino: cep }),
      });
      const data: FreteResponse = await res.json();
      if (data && data.valor !== undefined) {
        setFreteInfo(data);
        localStorage.setItem("valor_frete", data.valor.toString());
        localStorage.setItem("prazo_frete", data.prazo);
      }
    } catch (err) {
      console.error("Erro frete:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- VISÃO: RETIRADA OU TAXI/UBER ---
  if (method === 'local' || method === 'taxi') {
    return (
      <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl mb-4">
          <p className="text-sm text-red-900 font-medium leading-relaxed">
            {method === 'local' 
              ? "Você escolheu retirar no local. Informe seu WhatsApp para enviarmos a localização exata." 
              : "Para entrega via Uber/Taxi, informe seu contato para coordenarmos a coleta."}
          </p>
        </div>

        <div className="phone-input-container">
          <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
            WhatsApp para Contato
          </label>

          <PhoneInput
            country={'br'}
            value={cpe}
            onChange={(value) => setCpe(value)} 
            containerClass="!w-full"
            inputClass="!w-full !h-[52px] !rounded-md !border-gray-200 !text-base focus:!ring-2 focus:!ring-red-900 focus:!border-red-900 !transition-all"
            buttonClass="!rounded-l-md !border-gray-200 !bg-white"
            placeholder="(67) 99999-9999"
            masks={{ br: '(..) .....-....' }}
            localization={{ br: 'Brasil' }}
          />
        </div>
      </div>
    );
  }

  // --- VISÃO: CORREIOS ---
  return (
    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">CEP de Destino</label>
        <input
          value={cpe}
          onChange={(e) => setCpe(formatarCEP(e.target.value))}
          placeholder="00000-000"
          className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-900 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Endereço de Entrega</label>
        <textarea
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          placeholder="Rua, número, complemento e bairro"
          rows={3}
          className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-900 outline-none"
        />
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Custo de Envio (Correios)</p>
        {loading ? (
          <div className="mt-2 flex items-center gap-2 text-red-900 font-bold">
            <div className="w-4 h-4 border-2 border-red-900 border-t-transparent rounded-full animate-spin" />
            Calculando...
          </div>
        ) : freteInfo ? (
          <div className="mt-1 flex justify-between items-center">
            <span className="text-2xl font-black text-gray-900">{freteInfo.valorFormatado}</span>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">{freteInfo.prazo}</span>
          </div>
        ) : (
          <p className="text-sm text-gray-400 mt-1">Informe o CEP para calcular</p>
        )}
      </div>
    </div>
  );
}