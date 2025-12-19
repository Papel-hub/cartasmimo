import PhoneInput from 'react-phone-input-2';

type Props = {
  method: 'email' | 'whatsapp' | null;
  email: string;
  setEmail: (v: string) => void;
  whatsapp: string;
  setWhatsapp: (v: string) => void;
};

export default function DigitalFields({
  method,
  email,
  setEmail,
  whatsapp,
  setWhatsapp,
}: Props) {
  return (
    <div className="space-y-4">
      {method === 'email' && (
        <div>
          <label className="block text-sm font-medium mb-1">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>
      )}

      {method === 'whatsapp' && (
        <div>
          <label className="block text-sm font-medium mb-1">WhatsApp</label>
<PhoneInput
  country="br"
  value={whatsapp}
  onChange={setWhatsapp}
  enableSearch
  inputStyle={{
    width: '100%',
    height: '42px',
    borderRadius: '0.375rem',
  }}
  buttonStyle={{
    borderRadius: '0.375rem 0 0 0.375rem',
  }}
/>

        </div>
      )}
    </div>
  );
}
