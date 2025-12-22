// app/pagamento/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { db } from '../../lib/firebaseConfig'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
// Components
import PaymentMethodSelector from './components/PaymentMethodSelector';
import PixPaymentSection from './components/PixPaymentSection';
import CreditCardPaymentSection from './components/CreditCardPaymentSection';
import BoletoPaymentSection from './components/BoletoPaymentSection';

type PaymentMethod = 'pix' | 'cartao' | 'boleto' | '';

interface PaymentResponse {
  success: boolean;
  data?: { qr_code?: string; qr_code_base64?: string; boleto_url?: string; status?: string };
  error?: string;
}

export default function PagamentoPage() {
  const router = useRouter();

  // =========================
  // STATES
  // =========================
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loadingCart, setLoadingCart] = useState(true);

  const [metodo, setMetodo] = useState<PaymentMethod>('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pixKey, setPixKey] = useState<string | null>(null);
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const WHATSAPP_NUMBER = '5567992236484';
  const [email, setEmail] = useState<string>(''); 
   
  

  // =========================
  // LOAD CART
  // =========================
  useEffect(() => {
    const loadCart = () => {
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
          title: 'Carta mimo',
          price: mensagem.price || 79,
          format: mensagem.format || 'Digital',
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

    loadCart();
  }, [router]);

const handleBoletoPayment = async (boletoData: {
  first_name: string;
  last_name: string;
  identification: { type: string; number: string };
}) => {
  setLoading(true);
  try {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: cartTotal,
        email,
        description: 'Pagamento Mimo',
        method: 'boleto',
        ...boletoData,
      }),
    });

    const data: PaymentResponse = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Erro ao gerar boleto');

    if (data.data?.boleto_url) {
      setBoletoUrl(data.data.boleto_url);
    }
  } catch (err) {
    console.error(err);
    alert('Não foi possível gerar o boleto.');
  } finally {
    setLoading(false);
  }
};
const saveOrderToFirestore = async (paymentData: any) => {
  try {
    const deliveryStr = localStorage.getItem('fullDeliveryData');
    const mensagemStr = localStorage.getItem('mimo_mensagem');
    
    const delivery = deliveryStr ? JSON.parse(deliveryStr) : {};
    const mensagem = mensagemStr ? JSON.parse(mensagemStr) : {};

    const docRef = await addDoc(collection(db, "pedidos"), {
      // 1. Identificação Básica
      cliente_email: email || delivery.email || "Não informado",
      status: "pendente",
      valor_total: cartTotal,
      metodo_pagamento: metodo,
      
      // 2. A CARTA (O que você escreveu na /home)
      carta: {
        de: mensagem.from, // Aqui já vem "Anônimo" se o usuário marcou o checkbox
        para: mensagem.to,
        mensagem: mensagem.message,
        formato_slug: mensagem.format,
        data_escolhida: delivery.selectedDate // Data que ele escolheu no calendário
      },

      // 3. LOGÍSTICA (Onde e como entregar)
      entrega: {
        tipo: delivery.tipoEntrega, // digital, fisica ou ambos
        metodo_digital: delivery.digitalMethod, // whatsapp ou email
        metodo_fisico: delivery.fisicaMethod, // correios ou local
        endereco_completo: delivery.endereco,
        cpe: delivery.cpe,
        whatsapp_contato: delivery.whatsapp
      },

      // 4. ARQUIVOS NA VPS
      arquivos_vps: {
        audio_url: localStorage.getItem('mimo_final_audio') || null,
        video_url: localStorage.getItem('mimo_final_video') || null
      },

      // 5. RASTREIO E TEMPO
      criado_em: serverTimestamp(),
      payment_id: paymentData?.id || null, // ID do Mercado Pago para o Webhook achar
      payment_status: paymentData?.status || "pending"
    });

    console.log("✅ Pedido registrado no Firestore com ID:", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("❌ Erro crítico ao salvar pedido:", e);
    alert("Erro ao registrar pedido. Por favor, tire um print desta tela e nos chame no WhatsApp.");
  }
};
const handlePayment = async (method: 'pix' | 'boleto') => {
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
        description: 'Mimo Personalizado - Pedido',
        method: method,
      }),
    });

    const data: PaymentResponse = await res.json();

    if (!res.ok || !data.success) throw new Error(data.error || 'Erro no pagamento');

    // ✅ SUCESSO NO PAGAMENTO -> SALVAR NO FIREBASE
    await saveOrderToFirestore(data.data);

    if (method === 'pix' && data.data?.qr_code) {
      setQrCode(`data:image/png;base64,${data.data.qr_code_base64}`);
      setPixKey(data.data.qr_code);
    }

    if (method === 'boleto' && data.data?.boleto_url) {
      setBoletoUrl(data.data.boleto_url);
    }
  } catch (err) {
    console.error(err);
    alert('Erro ao processar. Verifique os dados e tente novamente.');
  } finally {
    setLoading(false);
  }
};

const handleWhatsAppFinalization = async () => {
  const deliveryStr = localStorage.getItem('fullDeliveryData');
  const delivery = deliveryStr ? JSON.parse(deliveryStr) : {};
  
  const title = cartItems[0]?.title ?? 'Carta Mimo';
  const total = cartTotal;
  const pedidoId = `WPP-${crypto.randomUUID().split('-')[0].toUpperCase()}`; // Ex: WPP-A1B2C3

  try {
    // 1. SALVAR NO FIREBASE
    await addDoc(collection(db, "pedidos"), {
      pedidoId,
      status: "finalizado_whatsapp",
      data: new Date().toISOString(),
      cliente: {
        email: delivery.email || 'Via WhatsApp',
        nome: delivery.nome || 'Não informado',
      },
      itens: cartItems,
      total: total,
      entrega: delivery,
      origem: "whatsapp"
    });

    // 2. MONTAR A MENSAGEM DO WHATSAPP
    const text = `*Pedido: ${pedidoId}* 
*Status: Aguardando Pagamento*
----------------------------------
*Produto:* ${title}
*Total:* R$ ${total.toFixed(2).replace('.', ',')}

*DETALHES DA ENTREGA:*
*Tipo:* ${delivery.tipoEntrega}
*Data Prevista:* ${delivery.selectedDate || 'A definir'}
*Destinatário:* ${delivery.destinatario || 'Não informado'}

*MÉTODOS:*
${delivery.digitalMethod ? `• Digital: ${delivery.digitalMethod}` : ''}
${delivery.fisicaMethod ? `• Físico: ${delivery.fisicaMethod}` : ''}
----------------------------------
Olá! Acabei de gerar meu pedido *${pedidoId}* no site e gostaria de finalizar o pagamento por aqui.`;

    // 3. ABRIR O WHATSAPP
    const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(whatsappLink, '_blank');

  } catch (error) {
    console.error("Erro ao salvar pedido via WhatsApp:", error);
    alert("Houve um erro ao registrar seu pedido. Tente novamente.");
  }
};
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow sm:px-16 px-8 pt-24 pb-8 sm:pt-28 sm:pb-12">


        {/* Título */}
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

          {/* Card principal */}
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
              onGenerateBoleto={handleBoletoPayment}
              loading={loading}
              boletoUrl={boletoUrl}
            />
          )}

                {/* Botões de ação */}
                <div className="space-y-3 pt-2">
                  <Link
                    href="/home"
                    className="w-full flex items-center justify-center gap-2 font-semibold p-3 border border-red-900 text-red-900 rounded-full hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </Link>
                </div>
                {/* Separador */}
                <div className="flex items-center py-2">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="mx-4 text-gray-500 text-sm font-medium">OU</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
      
                {/* Alternativas de pagamento */}
                <div className="space-y-3">
<button
  onClick={handleWhatsAppFinalization}
  className="w-full flex items-center justify-center gap-3 p-3 border-2 border-green-500 text-green-700 rounded-full hover:bg-green-50 font-semibold transition-all active:scale-95 shadow-sm"
>
  <Image src="/images/whatsapp.svg" alt="WhatsApp" width={24} height={24} />
  Finalizar via WhatsApp
</button>
                </div>
        </div>
      </main>
         
      <Footer />
    </div>
  );
}