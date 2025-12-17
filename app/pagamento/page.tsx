// app/pagamento/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';
import Image from 'next/image';

// Components de pagamento
import PaymentMethodSelector from './components/PaymentMethodSelector';
import PixPaymentSection from './components/PixPaymentSection';
import CreditCardPaymentSection from './components/CreditCardPaymentSection';
import BoletoPaymentSection from './components/BoletoPaymentSection';

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

export default function PagamentoPage() {
  const router = useRouter();

  // Estados do carrinho
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [loadingCart, setLoadingCart] = useState(true);

  // Estados de pagamento
  const [metodo, setMetodo] = useState<PaymentMethod>('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pixKey, setPixKey] = useState<string | null>(null);
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string>('');

  // Carregar carrinho
  useEffect(() => {
    const loadCartFromStorage = () => {
      const mensagemStr = localStorage.getItem('mimo_mensagem');
      const deliveryStr = localStorage.getItem('fullDeliveryData');

      if (!mensagemStr) {
        router.push('/home');
        return;
      }

      try {
        const mensagem = JSON.parse(mensagemStr);
        const delivery = deliveryStr ? JSON.parse(deliveryStr) : {};

        const item = {
          id: 'mensagem-personalizada',
          title: 'Mensagem Personalizada',
          price: mensagem.price || 79,
          format: mensagem.format || 'digital',
          message: mensagem.message || '',
          from: mensagem.from || '',
          to: mensagem.to || '',
          isAnonymous: mensagem.from === 'Anônimo',
          ...delivery,
        };

        setCartItems([item]);
        setCartTotal(Number(item.price));
      } catch (err) {
        console.error(err);
        router.push('/home');
      } finally {
        setLoadingCart(false);
      }
    };

    loadCartFromStorage();
  }, [router]);

  useEffect(() => {
    if (!loadingCart && cartItems.length === 0) {
      router.push('/home');
    }
  }, [loadingCart, cartItems, router]);

  // =========================
  // BOLETO
  // =========================
  const handleBoletoPayment = async (boletoData: {
    first_name: string;
    last_name: string;
    identification: { type: string; number: string };
  }) => {
    if (!email.trim()) {
      alert('Por favor, informe seu e-mail para receber o boleto.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cartTotal,
          email: email.trim(),
          description: 'Mensagem Personalizada - Mimo',
          method: 'boleto',
          ...boletoData,
        }),
      });

      const paymentResponse: PaymentResponse = await res.json();

      if (!res.ok || !paymentResponse.success) {
        throw new Error(paymentResponse.error || 'Erro ao gerar boleto');
      }

      if (paymentResponse.data?.boleto_url) {
        setBoletoUrl(paymentResponse.data.boleto_url);
      }
    } catch (err) {
      console.error(err);
      alert('Não foi possível gerar o boleto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // PIX / BOLETO SIMPLES
  // =========================
  const handlePayment = async (method: 'pix' | 'boleto') => {
    if (!email.trim()) {
      alert('Por favor, informe seu e-mail para receber os dados do pagamento.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cartTotal,
          email: email.trim(),
          description: 'Mensagem Personalizada - Mimo',
          method,
        }),
      });

      const paymentResponse: PaymentResponse = await res.json();

      if (!res.ok || !paymentResponse.success) {
        throw new Error(paymentResponse.error || 'Erro ao gerar pagamento');
      }

      if (method === 'pix') {
        if (paymentResponse.data?.qr_code_base64) {
          setQrCode(`data:image/png;base64,${paymentResponse.data.qr_code_base64}`);
        }
        if (paymentResponse.data?.qr_code) {
          setPixKey(paymentResponse.data.qr_code);
        }
      }

      if (method === 'boleto' && paymentResponse.data?.boleto_url) {
        setBoletoUrl(paymentResponse.data.boleto_url);
      }
    } catch (err) {
      console.error(err);
      alert('Não foi possível gerar o pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCart) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow sm:px-16 px-8 pt-24 pb-8 sm:pt-28 sm:pb-12">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Pagamento
        </h1>
        <p className="text-sm text-gray-600 text-center mb-8">
          Escolha o seu tipo de pagamento
        </p>

        <div className="max-w-md mx-auto mb-2 text-center">
          <p className="text-gray-700">
            Total da compra:
            <span className="ml-2 font-bold text-lg text-gray-900">
              R$ {cartTotal.toFixed(2).replace('.', ',')}
            </span>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8 space-y-8 max-w-lg mx-auto">
          <PaymentMethodSelector value={metodo} onChange={setMetodo} />

          {metodo === 'pix' && (
            <PixPaymentSection
              email={email}
              onEmailChange={setEmail}
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
              email={email}
              onEmailChange={setEmail}
              onGenerateBoleto={handleBoletoPayment}
              loading={loading}
              boletoUrl={boletoUrl}
            />
          )}

          <Link
            href="/home"
            className="w-full flex items-center justify-center font-semibold p-3 border border-red-900 text-red-900 rounded-full hover:bg-gray-50 transition"
          >
            Cancelar
          </Link>

          <div className="flex items-center py-2">
            <div className="flex-grow border-t border-gray-300" />
            <span className="mx-4 text-gray-500 text-sm font-medium">OU</span>
            <div className="flex-grow border-t border-gray-300" />
          </div>

          <button className="w-full flex items-center justify-center gap-3 p-3 border border-green-600 text-green-600 rounded-full hover:bg-green-50 font-medium transition">
            <Image src="/images/whatsapp.svg" alt="WhatsApp" width={24} height={24} />
            Finalizar via WhatsApp
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
