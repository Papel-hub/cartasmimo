'use client';

import Image from 'next/image';

type MensagemPreviewProps = {
  from: string;
  to: string;
  message: string;
  isChecked: boolean;
};

export default function MensagemPreview({ from, to, message, isChecked }: MensagemPreviewProps) {
  return (
    <div className="relative flex justify-center">
      <Image
        src="/images/cartae.svg"
        alt="Cartão de mensagem"
        width={500}
        height={500}
        className="w-full h-auto select-none"
      />
      <div className="font-semibold absolute text-[10px] sm:text-xs top-[49%] sm:top-[50%] left-[13%] sm:left-[13%] w-[32%] sm:w-[31%] h-[5%] text-gray-500 whitespace-pre-line break-words overflow-hidden leading-tight">
        {!isChecked && from ? from : 'Nome'}
      </div>
      <div className="font-semibold absolute text-[10px] sm:text-xs top-[54%] sm:top-[54.5%] left-[15%] sm:left-[15%] w-[30%] sm:w-[33%] h-[5%] text-gray-500 whitespace-pre-line break-words overflow-hidden leading-tight">
        {to || 'Nome'}
      </div>
      <div className="absolute text-[10px] sm:text-xs top-[62%] sm:top-[63%] left-[7%] sm:left-[8%] w-[36%] sm:w-[35%] text-gray-500 italic whitespace-pre-line break-words sm:max-h-[140px] max-h-[60px] overflow-hidden leading-tight">
        {message || 'Sua mensagem...'}
      </div>
    </div>
  );
}