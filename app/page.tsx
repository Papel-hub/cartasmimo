"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function WelcomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const carouselImages = ["/images/1.svg", "/images/2.svg", "/images/3.svg"];
  const docs = [
    {
      title: "Política de Privacidade",
      file: "/docs/politica-privacidade.pdf",
    },
    {
      title: "Termos de Uso e Condições",
      file: "/docs/termos-uso.pdf",
    },
    {
      title: "Política de Consumo de Bebidas Alcoólicas",
      file: "/docs/politica-bebidas.pdf",
    },
    {
      title: "Regras de Vendas e Entregas",
      file: "/docs/regras-entregas.pdf",
    },    
    {
      title: "Direitos de Texto, Imagem, Audio e Video",
      file: "/docs/direitos.pdf",
    },
  ];

  // Auto-avanço do carrossel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  // Garantir autoplay do vídeo
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current
        .play()
        .catch((error) => {
          console.warn("Autoplay falhou:", error);
        });
    }
  }, []);

  const safeNavigate = (url: string) => {
    if (!agreed) {
      setShowWarning(true);
      return;
    }
    window.location.href = url;
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* ESQUERDA - Carrossel */}
      <div className="hidden md:flex md:w-1/2 bg-red-900 flex-col items-center justify-center p-8 text-white relative overflow-hidden">
        <div className="absolute top-8 left-1/2 -translate-x-1/2">
          <Image
            src="/images/logopc.svg"
            alt="Mimo Meu e Seu"
            width={180}
            height={60}
            priority
          />
        </div>

        <div className="relative w-3/4 max-w-xs aspect-square rounded-full overflow-hidden shadow-xl mt-12">
          {carouselImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={img}
                alt={`Imagem ilustrativa ${index + 1}`}
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
          ))}
        </div>

        <div className="absolute bottom-8 flex space-x-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Ir para slide ${index + 1}`}
              className={`h-3 w-3 rounded-full ${
                index === currentSlide ? "bg-[#FCE1D0]" : "bg-white/40"
              } hover:bg-white`}
            />
          ))}
        </div>
      </div>

      {/* DIREITA - Conteúdo */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-6 md:p-12">
        <div className="max-w-md mx-auto w-full space-y-6">
          {/* Vídeo com overlay */}
          <div className="relative w-full flex items-center justify-center rounded-xl overflow-hidden shadow-sm bg-white aspect-video max-w-xs mx-auto">
            <video
              ref={videoRef}
              src="/videos/splash.mp4"
              muted
              loop
              playsInline
              autoPlay
              preload="auto"
              className="w-full h-full object-cover"
              aria-label="Vídeo de introdução da plataforma"
            />

          </div>

          {/* Botões */}
          <div className="space-y-4">
            <button
              onClick={() => safeNavigate("/home")}
              disabled={!agreed}
              className={`w-full py-4 rounded-full font-semibold transition shadow-sm ${
                agreed
                  ? "bg-red-900 text-[#FCE1D0] hover:bg-red-800 focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Entrar
            </button>
          </div>

          {/* Checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="agreement"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                setShowWarning(false);
              }}
              className="mt-1 h-5 w-5 text-red-900 rounded focus:ring-red-700 focus:ring-offset-2"
            />
            <label htmlFor="agreement" className="text-sm text-gray-700">
              Li e concordo com todas as políticas e termos.
            </label>
          </div>

          {/* Links para documentos */}
          <ul className="mt-2 text-sm space-y-1.5">
            {docs.map((doc, index) => (
              <li key={index}>
                <a
                  href={doc.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-900 hover:underline flex items-center gap-1"
                >
                  • {doc.title}
                </a>
              </li>
            ))}
          </ul>

          {/* Aviso */}
          {showWarning && (
            <p className="text-red-600 text-sm font-medium mt-1">
              Você deve concordar com os termos antes de continuar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}