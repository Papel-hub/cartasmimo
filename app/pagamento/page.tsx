'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Firebase
import { db } from '../../lib/firebaseConfig'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Components
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PaymentMethodSelector from './components/PaymentMethodSelector';
import PixPaymentSection from './components/PixPaymentSection';
import CreditCardPaymentSection from './components/CreditCardPaymentSection';
import BoletoPaymentSection from './components/BoletoPaymentSection';

// Types (Importadas do bloco acima)
import { 
  PaymentMethod, 
  DeliveryData, 
  MensagemData, 
  PaymentResponse, 
  PaymentResponseData, 
  OrderSchema 
} from '../../types/pagamento';

const WHATSAPP_NUMBER = '5567992236484';

export default function PagamentoPage() {
  const router = useRouter();

  // States
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [metodo, setMetodo] = useState<PaymentMethod>('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pixKey, setPixKey] = useState<string | null>(null);
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');

  // =========================
  // CARREGAR DADOS DO CARRINHO
  // =========================
  useEffect(() => {
    const mensagemStr = localStorage.getItem('mimo_mensagem');
    
    if (!mensagemStr) {
      router.push('/home');
      return;
    }

    try {
      const mensagem: MensagemData = JSON.parse(mensagemStr);
      setCartTotal(Number(mensagem.price) || 79);
    } catch (err) {
      console.error('Erro ao processar dados locais', err);
      router.push('/home');
    }
  }, [router]);

  // =========================
  // SALVAMENTO NO FIREBASE
  // =========================
  const saveOrderUniversal = useCallback(async (
    type: 'checkout' | 'whatsapp', 
    paymentData?: PaymentResponseData
  ): Promise<OrderSchema> => {
    const delivery: DeliveryData = JSON.parse(localStorage.getItem('fullDeliveryData') || '{}');
    const mensagem: MensagemData = JSON.parse(localStorage.getItem('mimo_mensagem') || '{}');
    
    const customId = type === 'whatsapp' 
      ? `WPP-${Math.random().toString(36).substring(2, 8).toUpperCase()}` 
      : `SITE-${Date.now().toString().slice(-6)}`;

    const orderData: OrderSchema = {
      pedidoId: customId,
      origem: type,
      status: type === 'whatsapp' ? "finalizado_whatsapp" : "pendente",
      cliente: {
        email: email || delivery.email || "Não informado",
        nome: delivery.nome || "Não informado",
        whatsapp: delivery.whatsapp || "Não informado"
      },
      conteudo: {
        de: mensagem.from || "Anônimo",
        para: mensagem.to || delivery.destinatario || "Não informado",
        texto: mensagem.message || "Sem mensagem",
        formato_slug: mensagem.format || "digital",
        data_entrega: delivery.selectedDate || null,
        audio_url: localStorage.getItem('mimo_final_audio'),
        video_url: localStorage.getItem('mimo_final_video')
      },
      logistica: {
        tipo: delivery.tipoEntrega || "digital",
        endereco: delivery.endereco || null,
        cpe: delivery.cpe || null,
        metodo_digital: delivery.digitalMethod || null,
        metodo_fisico: delivery.fisicaMethod || null
      },
      financeiro: {
        total: cartTotal,
        metodo: type === 'whatsapp' ? "whatsapp" : (metodo || "pix"),
        payment_id: paymentData?.id?.toString() || null,
        payment_status: paymentData?.status || "pending"
      },
      criado_em: serverTimestamp(),
    };

    await addDoc(collection(db, "pedidos"), orderData);
    return orderData;
  }, [email, cartTotal, metodo]);

  // =========================
  // HANDLERS DE PAGAMENTO
  // =========================
  const handlePayment = async (method: 'pix' | 'boleto', extraBoletoData?: Record<string, unknown>) => {
    if (!email) {
      alert("Por favor, preencha o e-mail para continuar.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cartTotal,
          email,
          description: 'Mimo Personalizado',
          method: method,
          ...(extraBoletoData || {})
        }),
      });

      const data: PaymentResponse = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Erro no pagamento');

      await saveOrderUniversal('checkout', data.data);

      if (method === 'pix' && data.data?.qr_code) {
        setQrCode(`data:image/png;base64,${data.data.qr_code_base64}`);
        setPixKey(data.data.qr_code);
      }

      if (method === 'boleto' && data.data?.boleto_url) {
        setBoletoUrl(data.data.boleto_url);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao processar pagamento.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppFinalization = async () => {
    setLoading(true);
    try {
      const savedData = await saveOrderUniversal('whatsapp');
      const msgParaWpp = `*NOVO PEDIDO: ${savedData.pedidoId}*\n` +
        `----------------------------------\n` +
        `*De:* ${savedData.conteudo.de}\n` +
        `*Para:* ${savedData.conteudo.para}\n` +
        `*Total:* R$ ${cartTotal.toFixed(2).replace('.', ',')}\n` +
        `----------------------------------\n` +
        `Olá! Quero finalizar o pagamento via WhatsApp.`;

      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msgParaWpp)}`, '_blank');
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar pedido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow sm:px-16 px-8 pt-24 pb-8 sm:pt-28 sm:pb-12">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Pagamento</h1>
        <p className="text-sm text-gray-600 text-center mb-8">Escolha o seu tipo de pagamento</p>

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

          {metodo === 'cartao' && <CreditCardPaymentSection cartTotal={cartTotal} />}

          {metodo === 'boleto' && (
            <BoletoPaymentSection
              email={email}
              onEmailChange={setEmail}
              onGenerateBoleto={(data: Record<string, unknown>) => handlePayment('boleto', data)}
              loading={loading}
              boletoUrl={boletoUrl}
            />
          )}

          <div className="space-y-3 pt-2">
            <Link
              href="/home"
              className="w-full flex items-center justify-center gap-2 font-semibold p-3 border border-red-900 text-red-900 rounded-full hover:bg-gray-50 transition"
            >
              Cancelar
            </Link>
          </div>

          <div className="flex items-center py-2">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm font-medium">OU</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button
            onClick={handleWhatsAppFinalization}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 p-3 border-2 border-green-500 text-green-700 rounded-full hover:bg-green-50 font-semibold transition-all active:scale-95 shadow-sm disabled:opacity-50"
          >
            <Image src="/images/whatsapp.svg" alt="WhatsApp" width={24} height={24} />
            {loading ? 'Processando...' : 'Finalizar via WhatsApp'}
          </button>
        </div>
      </main>
         
      <Footer />
    </div>
  );
}