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

// Types
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

  // ==========================================
  // 1. CARREGAR DADOS (CARRINHO + ENTREGA)
  // ==========================================
  useEffect(() => {
    // Busca dados de entrega para pré-preencher e-mail se existir
    const deliveryStr = localStorage.getItem('fullDeliveryData');
    if (deliveryStr) {
      try {
        const delivery = JSON.parse(deliveryStr);
        if (delivery.email) setEmail(delivery.email);
      } catch (err) {
        console.error('Erro ao processar dados de entrega', err);
      }
    }

    // Busca dados da mensagem/preço
    const mensagemStr = localStorage.getItem('mimo_mensagem');
    if (!mensagemStr) {
      router.push('/home');
      return;
    }

    try {
      const mensagem: MensagemData = JSON.parse(mensagemStr);
      setCartTotal(Number(mensagem.price) || 79);
    } catch (err) {
      console.error('Erro ao processar mensagem', err);
      router.push('/home');
    }
  }, [router]);

  // ==========================================
  // 2. LOGICA DE SALVAMENTO NO FIREBASE
  // ==========================================
  const saveOrderUniversal = useCallback(async (
    type: 'checkout' | 'whatsapp', 
    paymentData?: PaymentResponseData
  ): Promise<OrderSchema> => {
    // Pegamos os dados crus do local storage
    const deliveryRaw = localStorage.getItem('fullDeliveryData');
    const mensagemRaw = localStorage.getItem('mimo_mensagem');
    
    const delivery = deliveryRaw ? JSON.parse(deliveryRaw) : {};
    const mensagem = mensagemRaw ? JSON.parse(mensagemRaw) : {};
    
    // Gerador de ID amigável
    const customId = type === 'whatsapp' 
      ? `WPP-${Math.random().toString(36).substring(2, 8).toUpperCase()}` 
      : `SITE-${Date.now().toString().slice(-6)}`;

    const orderData: OrderSchema = {
      pedidoId: customId,
      origem: type,
      status: type === 'whatsapp' ? "finalizado_whatsapp" : "pendente_pagamento",
      cliente: {
        // O e-mail do estado 'email' é o mais atualizado (digitado no checkout)
        email: email || delivery.email || "Não informado",
        nome: delivery.destinatario || "Não informado",
        whatsapp: delivery.whatsapp || "Não informado"
      },
      conteudo: {
        de: mensagem.from || "Anônimo",
        para: delivery.destinatario || "Não informado",
        texto: mensagem.message || "Sem mensagem",
        formato_slug: mensagem.format || "digital",
        // A data vem como string ISO do localStorage, salvamos assim no Firebase
        data_entrega: delivery.dataEntrega || null, 
        audio_url: localStorage.getItem('mimo_final_audio'),
        video_url: localStorage.getItem('mimo_final_video')
      },
      logistica: {
        tipo: delivery.tipoEntrega || "digital",
        endereco: delivery.endereco || null,
        cpe: delivery.cpe || null,
        metodo_digital: delivery.metodoDigital || null,
        metodo_fisico: delivery.metodoFisico || null
      },
      financeiro: {
        total: cartTotal,
        metodo: type === 'whatsapp' ? "whatsapp" : (metodo || "pix"),
        payment_id: paymentData?.id?.toString() || null,
        payment_status: paymentData?.status || "pending"
      },
      criado_em: serverTimestamp(),
    };

    // Salva no Firestore
    await addDoc(collection(db, "pedidos"), orderData);
    return orderData;
  }, [email, cartTotal, metodo]);

  // ==========================================
  // 3. HANDLERS (PIX, BOLETO, WHATSAPP)
  // ==========================================
  const handlePayment = async (method: 'pix' | 'boleto', extraBoletoData?: Record<string, unknown>) => {
    if (!email || !email.includes('@')) {
      alert("Por favor, insira um e-mail válido para processar o pagamento.");
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

      // Salva no Firebase assim que o gateway responde com sucesso
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
      alert('Erro ao processar pagamento. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppFinalization = async () => {
    setLoading(true);
    try {
      const savedData = await saveOrderUniversal('whatsapp');
      
      // Formata a data para uma leitura amigável no WhatsApp
      const dataFormatada = savedData.conteudo.data_entrega 
        ? new Date(savedData.conteudo.data_entrega).toLocaleDateString('pt-BR')
        : 'A combinar';

      const msgParaWpp = `*NOVO PEDIDO: ${savedData.pedidoId}*\n` +
        `----------------------------------\n` +
        `*De:* ${savedData.conteudo.de}\n` +
        `*Para:* ${savedData.conteudo.para}\n` +
        `*Data de Entrega:* ${dataFormatada}\n` + // Adicionado aqui
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
        <p className="text-sm text-gray-600 text-center mb-8">Escolha como prefere pagar seu Mimo</p>

        <div className="max-w-md mx-auto mb-4 text-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-600 text-sm">Total a pagar:</p>
          <p className="font-extrabold text-2xl text-red-900">
            R$ {cartTotal.toFixed(2).replace('.', ',')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8 space-y-8 max-w-lg mx-auto border border-gray-100">
          <PaymentMethodSelector value={metodo} onChange={setMetodo} />

          {/* Seções de Pagamento Dinâmicas */}
          <div>
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

            {!metodo && (
              <p className="text-center text-gray-400 text-sm italic">
                Selecione um método acima para continuar
              </p>
            )}
          </div>

          <div className="flex items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-4 text-gray-400 text-xs font-bold uppercase tracking-widest">Ou</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <button
            onClick={handleWhatsAppFinalization}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 p-4 border-2 border-green-500 text-green-700 rounded-full hover:bg-green-50 font-bold transition-all active:scale-95 disabled:opacity-50"
          >
            <Image src="/images/whatsapp.svg" alt="WhatsApp" width={24} height={24} />
            Finalizar via WhatsApp
          </button>

          <div className="pt-4 text-center">
             <Link href="/dados-entrega" className="text-sm text-gray-400 hover:text-gray-600 underline">
                Voltar aos dados de entrega
             </Link>
          </div>
        </div>
      </main>
          
      <Footer />
    </div>
  );
}