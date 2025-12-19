type Props = {
  endereco: string;
  setEndereco: (v: string) => void;
  cpe: string;
  setCpe: (v: string) => void;
};

export default function FisicaFields({
  endereco,
  setEndereco,
  cpe,
  setCpe,
}: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Endereço</label>
        <input
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">CEP</label>
        <input
          value={cpe}
          onChange={(e) => setCpe(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
      </div>

      <div className="font-semibold text-red-900">
        Estimativa do frete: R$
      </div>
    </div>
  );
}
