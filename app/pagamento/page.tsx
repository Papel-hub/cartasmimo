'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Firebase
import { db } from '../../lib/firebaseConfig'; 
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';

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
  MensagemData, 
  PaymentResponse, 
  PaymentResponseData, 
  OrderSchema 
} from '../../types/pagamento';

const WHATSAPP_NUMBER = '5567992236484';

export default function PagamentoPage() {
  const router = useRouter();

  const [cartTotal, setCartTotal] = useState<number>(0);
  const [metodo, setMetodo] = useState<PaymentMethod>('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pixKey, setPixKey] = useState<string | null>(null);
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [freteValor, setFreteValor] = useState<number>(0);
  const [fretePrazo, setFretePrazo] = useState<string>('');

  // 1. Monitora montagem e carrega dados do Storage com segurança
  useEffect(() => {
    setIsMounted(true);
    
    if (typeof window !== 'undefined') {
      const deliveryStr = localStorage.getItem('fullDeliveryData');
      const mensagemStr = localStorage.getItem('mimo_mensagem');
      const valorFreteStr = localStorage.getItem('valor_frete');
      const prazoStr = localStorage.getItem('prazo_frete');

      if (!mensagemStr) {
        router.push('/home');
        return;
      }

      try {
        const delivery = deliveryStr ? JSON.parse(deliveryStr) : {};
        const mensagem: MensagemData = JSON.parse(mensagemStr);
        
        if (delivery.email) setEmail(delivery.email);
        
        const precoProduto = Number(mensagem.price) || 79;
        const vFrete = Number(valorFreteStr) || 0;

        setFreteValor(vFrete);
        setFretePrazo(prazoStr || 'PAC');
        setCartTotal(precoProduto + vFrete);
      } catch (err) {
        console.error('Erro ao processar dados:', err);
      }
    }
  }, [router]);

  // 2. Monitoramento de pagamento (Firebase)
  useEffect(() => {
    if (!paymentId) return;
    const q = query(collection(db, "pedidos"), where("financeiro.payment_id", "==", paymentId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().status === "pago") router.push('/pagamento/sucesso');
      });
    });
    return () => unsubscribe();
  }, [paymentId, router]);

  const saveOrderUniversal = useCallback(async (
    type: 'checkout' | 'whatsapp', 
    paymentData?: PaymentResponseData
  ): Promise<OrderSchema> => {
    if (typeof window === 'undefined') return {} as OrderSchema;

    const deliveryRaw = localStorage.getItem('fullDeliveryData');
    const mensagemRaw = localStorage.getItem('mimo_mensagem');
    
    const delivery = deliveryRaw ? JSON.parse(deliveryRaw) : {};
    const mensagem = mensagemRaw ? JSON.parse(mensagemRaw) : {};
    
    const customId = type === 'whatsapp' 
      ? `WPP-${Math.random().toString(36).substring(2, 8).toUpperCase()}` 
      : `SITE-${Date.now().toString().slice(-6)}`;

    const orderData: OrderSchema = {
      pedidoId: customId,
      origem: type,
      status: type === 'whatsapp' ? "finalizado_whatsapp" : "pendente_pagamento",
      cliente: {
        email: email || delivery.email || "Não informado",
        nome: delivery.destinatario || "Não informado",
        whatsapp: delivery.whatsapp || "Não informado"
      },
      conteudo: {
        de: mensagem.from || "Anônimo",
        para: delivery.destinatario || "Não informado",
        texto: mensagem.message || "Sem mensagem",
        formato_slug: mensagem.format || "digital",
        data_entrega: delivery.dataEntrega || null, 
        audio_url: localStorage.getItem('mimo_final_audio'),
        video_url: localStorage.getItem('mimo_final_video')
      },
      logistica: {
        tipo: delivery.tipoEntrega || "digital",
        endereco: delivery.endereco || "Não informado",
        cpe: delivery.metodoFisico === 'correios' ? (delivery.cep || "Não informado") : "N/A",
        whatsapp_entrega: (delivery.metodoFisico === 'local' || delivery.metodoFisico === 'taxi') ? delivery.telefoneContatoFisico : (delivery.whatsapp || null),
        metodo_digital: delivery.metodoDigital || null,
        metodo_fisico: delivery.metodoFisico || null,
        prazo_estimado: fretePrazo
      },
      financeiro: {
        total: cartTotal,
        valor_produto: cartTotal - freteValor,
        valor_frete: freteValor,
        metodo: type === 'whatsapp' ? "whatsapp" : (metodo || "pix"),
        payment_id: paymentData?.id?.toString() || null,
        payment_status: paymentData?.status || "pending"
      },
      criado_em: serverTimestamp(),
    };

    await addDoc(collection(db, "pedidos"), orderData);
    return orderData;
  }, [email, cartTotal, metodo, freteValor, fretePrazo]);

  const handlePayment = async (method: 'pix' | 'boleto', extraBoletoData?: Record<string, unknown>) => {
    if (!email || !email.includes('@')) {
      alert("Por favor, insira um e-mail válido.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: cartTotal, email, description: 'Mimo Personalizado', method, ...extraBoletoData }),
      });
      const data: PaymentResponse = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Erro no pagamento');
      await saveOrderUniversal('checkout', data.data);
      if (method === 'pix' && data.data?.qr_code) {
        setQrCode(`data:image/png;base64,${data.data.qr_code_base64}`);
        setPixKey(data.data.qr_code);
        setPaymentId(data.data.id?.toString() || null);
      }
      if (method === 'boleto' && data.data?.boleto_url) setBoletoUrl(data.data.boleto_url);
    } catch (err) {
      console.error(err);
      alert('Erro ao processar pagamento.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppFinalization = async () => {
    if (typeof window === 'undefined') return;
    setLoading(true);
    try {
      const savedData = await saveOrderUniversal('whatsapp');
      const dataFormatada = savedData.conteudo.data_entrega 
        ? new Date(savedData.conteudo.data_entrega).toLocaleDateString('pt-BR')
        : 'A combinar';

const msgParaWpp = `*NOVO PEDIDO: ${savedData.pedidoId}*\n` +
  `----------------------------------\n` +
  `*Para:* ${savedData.conteudo.para}\n` +
  `*Método:* ${savedData.logistica.metodo_fisico === 'taxi' ? 'Uber/Táxi' : savedData.logistica.metodo_fisico === 'local' ? 'Retirada' : 'Correios'}\n` +
  `*Detalhes:* ${savedData.logistica.endereco}\n` +
  (savedData.logistica.metodo_fisico === 'correios' ? `*CEP:* ${savedData.logistica.cpe}\n` : '') +
  `*Data Entrega:* ${dataFormatada}\n` +
  `----------------------------------\n` +
  `*Total:* R$ ${cartTotal.toFixed(2).replace('.', ',')}\n` +
  `----------------------------------\n` +
  `Olá! Gostaria de finalizar o pagamento via WhatsApp.`;

      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msgParaWpp)}`, '_blank');
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar pedido.");
    } finally {
      setLoading(false);
    }
  };

  // Trava de segurança para o Build (SSR)
  if (!isMounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow sm:px-16 px-8 pt-24 pb-8 sm:pt-28 sm:pb-12">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Pagamento</h1>
        <p className="text-sm text-gray-600 text-center mb-8">Escolha como prefere pagar seu Mimo</p>
        
        <div className="max-w-lg mx-auto mb-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="space-y-2 pb-3 mb-3 border-b border-dashed border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Mimo Escolhido:</span>
              <span className="font-medium text-gray-900">
                R$ {(cartTotal - freteValor).toFixed(2).replace('.', ',')}
              </span>
            </div>
            {freteValor > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  Frete para entrega:
                  <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-400">
                    {fretePrazo}
                  </span>
                </span>
                <span className="font-medium text-gray-900">
                  + R$ {freteValor.toFixed(2).replace('.', ',')}
                </span>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-bold">Total a pagar:</span>
            <div className="text-right">
              <p className="font-extrabold text-3xl text-red-900 leading-none">
                R$ {cartTotal.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8 space-y-8 max-w-lg mx-auto border border-gray-100">
          <PaymentMethodSelector value={metodo} onChange={setMetodo} />
          <div>
            {metodo === 'pix' && <PixPaymentSection email={email} onEmailChange={setEmail} onGeneratePix={() => handlePayment('pix')} loading={loading} qrCode={qrCode} pixKey={pixKey} />}
            {metodo === 'cartao' && <CreditCardPaymentSection cartTotal={cartTotal} />}
            {metodo === 'boleto' && <BoletoPaymentSection email={email} onEmailChange={setEmail} onGenerateBoleto={(data: Record<string, unknown>) => handlePayment('boleto', data)} loading={loading} boletoUrl={boletoUrl} />}
          </div>
          <button onClick={handleWhatsAppFinalization} disabled={loading} className="w-full flex items-center justify-center gap-3 p-4 border-2 border-green-500 text-green-700 rounded-full hover:bg-green-50 font-bold transition-all active:scale-95 disabled:opacity-50">
            <Image src="/images/whatsapp.svg" alt="WhatsApp" width={24} height={24} />
            Finalizar via WhatsApp
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}