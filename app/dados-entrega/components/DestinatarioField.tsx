type Props = {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
};

export default function DestinatarioField({ value, onChange, disabled }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Nome do destinatário</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full p-2 border rounded-md"
        placeholder="Ex: Maria Silva"
      />
    </div>
  );
}
