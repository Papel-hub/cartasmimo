"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function CompraRealizadaPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(7); // Aumentei um pouco para o cliente respirar

  useEffect(() => {
    // 1. LIMPEZA DOS DADOS: Importante para não bugar o próximo pedido
    localStorage.removeItem('fullDeliveryData');
    localStorage.removeItem('valor_frete');
    localStorage.removeItem('prazo_frete');
    localStorage.removeItem('mimo_mensagem');
    localStorage.removeItem('frete_info_completo');

    // 2. CONTADOR
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown === 0) {
      router.push("/home");
    }

    return () => clearInterval(timer);
  }, [countdown, router]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow flex items-center justify-center px-6 pt-24 pb-12">
        <div className="bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/50 max-w-md w-full text-center border border-gray-100">
          
          {/* Ícone de Sucesso */}
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full animate-bounce">
              <CheckCircleIcon className="w-16 h-16 text-green-600" />
            </div>
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Mimo Confirmado!
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Sua compra foi realizada com sucesso. <br />
            Preparamos tudo com muito carinho! ✅
          </p>

          {/* Loader de Progresso */}
          <div className="relative h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-6">
            <div 
              className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 7) * 100}%` }}
            ></div>
          </div>

          <p className="text-xs text-gray-400 mb-8 font-medium uppercase tracking-widest">
            Redirecionando em {countdown} segundos...
          </p>

          <button
            onClick={() => router.push("/home")}
            className="w-full py-4 bg-red-900 text-white font-bold rounded-full hover:bg-red-800 transition-all shadow-lg shadow-red-900/20 active:scale-95"
          >
            Voltar para o Início
          </button>
        </div>
      </main>

      <Footer /> 
    </div>
  );
}