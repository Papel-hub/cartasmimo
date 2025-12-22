import { useEffect, useState } from "react";

type Props = {
  endereco: string;
  setEndereco: (v: string) => void;
  cpe: string;
  setCpe: (v: string) => void;
};

export default function FisicaFields({ endereco, setEndereco, cpe, setCpe }: Props) {
  const [freteInfo, setFreteInfo] = useState<{ valor: string; prazo: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Máscara de CEP (00000-000)
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
    
    const data = await res.json();
    
    // LOG PARA VOCÊ VER NO NAVEGADOR (Aperte F12 > Console)
    console.log("Dados recebidos do frete:", data);

    if (data && data.valor) {
      setFreteInfo({
        valor: data.valor,
        prazo: data.prazo
      });
    } else {
      setFreteInfo({ valor: "---", prazo: "N/A" });
    }
  } catch (err) {
    console.error("Erro na requisição:", err);
    setFreteInfo({ valor: "Erro", prazo: "N/A" });
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
          className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Endereço</label>
        <input
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          placeholder="Rua, número, bairro..."
          className="w-full p-2 border rounded-md"
        />
      </div>

      <div className="p-4 bg-gray-50 border-l-4 border-red-600 rounded-r-md">
        <p className="text-sm text-gray-600">Estimativa do frete:</p>
        {loading ? (
          <p className="text-lg font-bold animate-pulse">Consultando Correios...</p>
        ) : (
          <div className="flex justify-between items-baseline">
            <p className="text-2xl font-black text-red-900">
              R$ {freteInfo?.valor || "0,00"}
            </p>
            {freteInfo?.prazo && (
              <span className="text-xs font-semibold text-gray-500">
                Prazo: {freteInfo.prazo} dias
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}