import { useEffect, useState } from "react";

type Props = {
  endereco: string;
  setEndereco: (v: string) => void;
  cpe: string;
  setCpe: (v: string) => void;
};

// Interface para bater com o que sua API finalizada retorna
interface FreteResponse {
  valor: number;
  valorFormatado: string;
  prazo: string;
  servico?: string;
  error?: string;
}

export default function FisicaFields({ endereco, setEndereco, cpe, setCpe }: Props) {
  const [freteInfo, setFreteInfo] = useState<FreteResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const formatarCEP = (v: string) => {
    return v.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").slice(0, 9);
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpe(formatarCEP(e.target.value));
  };

  useEffect(() => {
    const cepLimpo = cpe.replace(/\D/g, "");
    if (cepLimpo.length === 8) {
      calcular(cepLimpo);
    }
  }, [cpe]);

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
          // Atualiza o estado local para exibir no componente atual
          setFreteInfo(data);
          
          // --- PERSISTÊNCIA PARA A PÁGINA DE PAGAMENTO ---
          
          // 1. Salva o valor numérico (ex: 65.46) para somar no total
          localStorage.setItem("valor_frete", data.valor.toString());
          
          // 2. Salva o prazo formatado (ex: "9 dias úteis") para o resumo do pedido
          localStorage.setItem("prazo_frete", data.prazo);
          
          // 3. Salva o nome do serviço (ex: "PAC")
          localStorage.setItem("servico_frete", data.servico || "PAC");

          // 4. Salva o JSON completo como backup de segurança
          localStorage.setItem("frete_info_completo", JSON.stringify(data));

        } else {
          // Caso a API retorne erro ou o CEP seja inválido para entrega
          setFreteInfo(null);
          localStorage.removeItem("valor_frete");
          localStorage.removeItem("prazo_frete");
          localStorage.removeItem("servico_frete");
          localStorage.removeItem("frete_info_completo");
        }
      } catch (err) {
        console.error("Erro na requisição de frete:", err);
        setFreteInfo(null);
        // Limpa dados antigos em caso de falha na rede
        localStorage.removeItem("valor_frete");
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium text-gray-700">CEP</label>
        <input
          value={cpe}
          onChange={handleCepChange}
          placeholder="00000-000"
          className="w-full p-2 border rounded-md focus:ring-red-600 focus:border-red-600 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Endereço Completo</label>
        <input
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          placeholder="Rua, número, bairro..."
          className="w-full p-2 border rounded-md focus:ring-red-600 focus:border-red-600 outline-none"
        />
      </div>

      {/* BOX DE FRETE */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Entrega via PAC</p>
        
        {loading ? (
          <div className="mt-2 flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-red-600">Calculando frete...</p>
          </div>
        ) : freteInfo ? (
          <div className="mt-2 flex justify-between items-end">
            <div>
              <p className="text-2xl font-black text-gray-900">
                {freteInfo.valorFormatado}
              </p>
              <p className="text-[10px] text-gray-400 font-medium italic">
                {freteInfo.prazo}
              </p>
            </div>
            <div className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded font-bold">
              FRETE CALCULADO
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-400">Digite um CEP válido para calcular</p>
        )}
      </div>
    </div>
  );
}