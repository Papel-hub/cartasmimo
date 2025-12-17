
type Option<T extends string> = {
  id: T;
  label: string;
};

interface DeliveryMethodSectionProps<T extends string> {
  title: string;
  subtitle?: string;
  options: Option<T>[];
  selected: T | null; // ✅ aceita null
  onSelect: (value: T) => void; // ✅ agora é uma função simples, não Dispatch
}

export default function DeliveryMethodSection<T extends string>({
  title,
  subtitle,
  options,
  selected,
  onSelect,
}: DeliveryMethodSectionProps<T>) {
  return (
    <section className="mb-8">
      <h2 className="text-sm font-medium text-gray-800 mb-3">
        {title} {subtitle && <span className="text-gray-400">{subtitle}</span>}
      </h2>
      <div className="space-y-3">
        {options.map((opt) => (
          <label
            key={opt.id}
            className="flex items-center p-3 rounded-lg border border-gray-300 space-x-3 cursor-pointer"
          >
            <input
              type="radio"
              name={title}
              value={opt.id}
              checked={selected === opt.id}
              onChange={() => onSelect(opt.id)} // ✅ chama com valor direto
              className="h-4 w-4 accent-red-900 focus:ring-red-800"
            />
            <span className="text-gray-800">{opt.label}</span>
          </label>
        ))}
      </div>
    </section>
  );
}