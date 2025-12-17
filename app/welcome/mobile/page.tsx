"use client";

import { useState } from "react";
import Image from "next/image";

export default function WelcomeMobilePage() {
  const [agreed, setAgreed] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const docs = [
    { title: "Política de Privacidade", file: "/docs/politica-privacidade.pdf" },
    { title: "Termos de Uso e Condições", file: "/docs/termos-uso.pdf" },
    { title: "Política de Consumo de Bebidas Alcoólicas", file: "/docs/politica-bebidas.pdf" },
    { title: "Regras de Vendas e Entregas", file: "/docs/regras-entregas.pdf" },
  ];

  const safeNavigate = (url: string) => {
    if (!agreed) {
      setShowWarning(true);
      return;
    }
    window.location.href = url;
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-red-900 p-6 text-center">
      {/* Logo */}
      <div className="mb-6 flex justify-center">
        <Image
          src="/images/logo.svg"
          alt="Mimo Meu e Seu"
          width={140}
          height={140}
          priority
        />
      </div>

      {/* Conteúdo principal */}
      <div className="space-y-6 max-w-sm w-full">
        <p className="text-lg font-medium text-[#FCE1D0]">
          Palavras dizem. Atitudes provam.
          <br />
          <strong className="font-bold">Surpreenda quem você ama!</strong>
        </p>

        {/* Botões */}
        <button
          onClick={() => safeNavigate("/auth/login")}
          disabled={!agreed}
          className={`w-full py-4 px-3 font-semibold rounded-full transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FCE1D0] focus:ring-opacity-50 ${
            agreed
              ? "bg-[#FCE1D0] text-red-900 hover:bg-red-100"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
          }`}
          aria-label="Entrar na sua conta"
        >
          Entrar
        </button>

        <button
          onClick={() => safeNavigate("/home")}
          disabled={!agreed}
          className={`w-full py-4 px-3 font-semibold rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#FCE1D0] focus:ring-opacity-50 ${
            agreed
              ? "border border-[#FCE1D0] text-[#FCE1D0] hover:bg-red-800 hover:text-white"
              : "border border-gray-400 text-gray-300 cursor-not-allowed"
          }`}
          aria-label="Continuar como visitante"
        >
          Continuar como visitante
        </button>

        {/* Checkbox de concordância */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="agreement-mobile"
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked);
              setShowWarning(false);
            }}
            className="mt-1 h-5 w-5 text-[#FCE1D0] rounded focus:ring-red-700"
          />
          <label htmlFor="agreement-mobile" className="text-sm text-[#FCE1D0] text-left">
            Li e concordo com todas as políticas e termos.
          </label>
        </div>

        {/* Links para documentos */}
        <ul className="text-sm space-y-2 text-[#FCE1D0]">
          {docs.map((doc, index) => (
            <li key={index}>
              <a
                href={doc.file}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center gap-1"
              >
                • {doc.title}
              </a>
            </li>
          ))}
        </ul>

        {/* Aviso */}
        {showWarning && (
          <p className="text-red-200 text-sm font-medium">
            Você precisa concordar com os termos para continuar.
          </p>
        )}
      </div>
    </div>
  );
}