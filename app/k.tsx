'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';
import Image from 'next/image';

// Components
import PaymentMethodSelector from './pagamento/components/PaymentMethodSelector';
import PixPaymentSection from './pagamento/components/PixPaymentSection';
import CreditCardPaymentSection from './pagamento/components/CreditCardPaymentSection';
import BoletoPaymentSection from './pagamento/components/BoletoPaymentSection';

type PaymentMethod = 'pix' | 'cartaomimo' | 'cartao' | 'boleto' | '';

interface PaymentResponse {
  success: boolean;
  data?: {
    qr_code?: string;
    qr_code_base64?: string;
    boleto_url?: string;
    status?: string;
  };
  error?: string;
}





  // =========================
  // PIX / BOLETO SIMPLE
  // =========================
  const handlePayment = async (method: 'pix' | 'boleto') => {
    if (!contact.trim()) {
      alert('Informe um e-mail ou WhatsApp.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cartTotal,
          contact: contact.trim(),
          description: 'Mensagem Personalizada - Mimo',
          method,
        }),
      });

      const data: PaymentResponse = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error);
      }

      if (method === 'pix') {
        if (data.data?.qr_code_base64) {
          setQrCode(`data:image/png;base64,${data.data.qr_code_base64}`);
        }
        if (data.data?.qr_code) {
          setPixKey(data.data.qr_code);
        }
      }

      if (method === 'boleto' && data.data?.boleto_url) {
        setBoletoUrl(data.data.boleto_url);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar pagamento.');
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // BOLETO COMPLETO
  // =========================
  const handleBoletoPayment = async (boletoData: any) => {
    if (!boletoEmail.trim()) {
      alert('Informe o e-mail para o boleto.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cartTotal,
          contact: boletoEmail.trim(),
          description: 'Mensagem Personalizada - Mimo',
          method: 'boleto',
          ...boletoData,
        }),
      });

      const data: PaymentResponse = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error);
      }

      if (data.data?.boleto_url) {
        setBoletoUrl(data.data.boleto_url);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar boleto.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCart) {
    return <div className="min-h-screen flex items-center justify-center">...</div>;
  }



  // =========================
  // RENDER
  // =========================
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow px-8 pt-24 pb-12">
        <h1 className="text-2xl font-bold text-center mb-6">Pagamento</h1>

        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-md p-8 space-y-8">
          <p className="text-center font-semibold">
            Total: R$ {cartTotal.toFixed(2).replace('.', ',')}
          </p>

          <PaymentMethodSelector value={metodo} onChange={handleMethodChange} />

{metodo === 'pix' && (
  <PixPaymentSection
    contact={contact}
    onContactChange={setContact}
    onGeneratePix={() => handlePayment('pix')}
    loading={loading}
    qrCode={qrCode}
    pixKey={pixKey}
  />
)}


          {metodo === 'cartao' && (
            <CreditCardPaymentSection cartTotal={cartTotal} />
          )}

          {metodo === 'boleto' && (
            <BoletoPaymentSection
              email={boletoEmail}
              onEmailChange={setBoletoEmail}
              onGenerateBoleto={handleBoletoPayment}
              loading={loading}
              boletoUrl={boletoUrl}
            />
          )}

          <Link
            href="/home"
            className="block text-center border border-red-600 text-red-600 py-3 rounded-full"
          >
            Cancelar
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-sm text-gray-500">OU</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <button
            onClick={() => window.open(whatsappLink, '_blank')}
            className="w-full flex items-center justify-center gap-3 p-3 border border-green-600 text-green-600 rounded-full hover:bg-green-50 font-medium transition"
          >
            <Image src="/images/whatsapp.svg" alt="WhatsApp" width={24} height={24} />
            Finalizar via WhatsApp
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
