// app/pagamento/components/EmailInput.tsx

interface EmailInputProps {
  value: string;
  onChange: (email: string) => void;
  error: string | null;
  setError: (error: string | null) => void;
  label?: string;
  placeholder?: string;
}

export default function EmailInput({
  value,
  onChange,
  error,
  setError,
  label = 'Seu e-mail para envio do comprovante',
  placeholder = 'exemplo@dominio.com',
}: EmailInputProps) {
  return (
    <div>
      <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        id="email-input"
        type="email"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (error) setError(null);
        }}
        placeholder={placeholder}
        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}