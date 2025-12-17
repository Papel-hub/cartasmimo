import Image from 'next/image';

export default function ImageCard() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Image
        src="/images/s1.svg"
        className="rounded-xl shadow-lg"
        alt="cartão"
        width={800} // largura real ou aproximada
        height={400} // altura real ou aproximada
      />
    </div>
  );
}

