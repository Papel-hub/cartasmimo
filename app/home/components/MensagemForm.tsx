'use client';

type MensagemFormProps = {
  isChecked: boolean;
  onToggleAnonimo: (checked: boolean) => void;
  from: string;
  to: string;
  message: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onMessageChange: (value: string) => void;
};

export default function MensagemForm({
  isChecked,
  onToggleAnonimo,
  from,
  to,
  message,
  onFromChange,
  onToChange,
  onMessageChange,
}: MensagemFormProps) {
  return (
    <>
      {/* Anônimo */}
      <div className="flex justify-center items-center gap-3 font-sans">
        <label className="toggle-switch relative inline-block h-6 w-12 cursor-pointer">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => onToggleAnonimo(e.target.checked)}
            className="peer sr-only"
            aria-label="Enviar de forma anônima"
          />
          <span
            className={`slider absolute inset-0 rounded-full transition-colors duration-300 ${
              isChecked ? 'bg-[#9e2121]' : 'bg-gray-300'
            }`}
          />
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-300 ${
              isChecked ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </label>
        <span className="text-sm text-gray-800 font-bold">Enviar de forma anônima</span>
      </div>

      {/* Campos de texto */}
      <div className="space-y-4">
        <div>
          <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">
            De:
          </label>
          <input
            id="from"
            type="text"
            placeholder="Digite o seu nome"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            disabled={isChecked}
          />
        </div>

        <div>
          <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
            Para:
          </label>
          <input
            id="to"
            type="text"
            placeholder="Digite o nome de quem deseja"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Mensagem:
          </label>
          <textarea
            id="message"
            placeholder="Escreva sua mensagem aqui..."
            className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-red-500 focus:outline-none"
            rows={3}
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
          />
        </div>
      </div>
    </>
  );
}