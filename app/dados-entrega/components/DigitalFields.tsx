// components/DigitalFields.tsx
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface DigitalFieldsProps {
  method: 'whatsapp' | 'email' | null;
  email: string;
  setEmail: (val: string) => void;
  whatsapp: string;
  setWhatsapp: (val: string) => void;
}

export default function DigitalFields({ method, email, setEmail, whatsapp, setWhatsapp }: DigitalFieldsProps) {
  if (method === 'email') {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">E-mail do Destinatário</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="exemplo@email.com"
          className="w-full p-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-red-900/20 outline-none transition-all"
        />
      </div>
    );
  }

  if (method === 'whatsapp') {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">WhatsApp do Destinatário</label>
        <div className="phone-input-container">
          <PhoneInput
            country={'br'} // Define Brasil como padrão
            value={whatsapp}
            onChange={(phone) => setWhatsapp(phone)}
            containerClass="!w-full"
            inputClass="!w-full !h-[58px] !rounded-2xl !border-gray-200 !text-base focus:!ring-2 focus:!ring-red-900/20"
            buttonClass="!rounded-l-2xl !border-gray-200 !bg-white"
            placeholder="(67) 99999-9999"
            masks={{ br: '(..) .....-....' }}
          />
        </div>
      </div>
    );
  }

  return null;
}