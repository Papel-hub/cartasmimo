type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
};

export default function AnonymousCheckbox({ checked, onChange }: Props) {
  return (
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-sm">Salvar dados como padrão</span>
    </label>
  );
}
