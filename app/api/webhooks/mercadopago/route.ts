import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { db } from '../../../../lib/firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    // 1. O Mercado Pago envia o ID no body ou na URL
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    
    // Tenta pegar o ID de todas as formas que o MP envia
    const id = body.data?.id || searchParams.get('data.id') || body.id;
    const type = body.type || searchParams.get('type');

    console.log(`🔔 Webhook recebido - Tipo: ${type}, ID: ${id}`);

    if (type === 'payment' && id) {
      const paymentClient = new Payment(client);
      const payment = await paymentClient.get({ id: String(id) });

      // Verificamos se o pagamento está aprovado
      if (payment.status === 'approved') {
        const pedidosRef = collection(db, "pedidos");
        
        // BUSCA IMPORTANTE: Procura pelo payment_id dentro do objeto financeiro
        const q = query(pedidosRef, where("financeiro.payment_id", "==", String(id)));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const pedidoDoc = querySnapshot.docs[0];
          
          // Atualiza o documento no Firebase
          await updateDoc(doc(db, "pedidos", pedidoDoc.id), {
            "status": "pago",
            "financeiro.payment_status": "approved",
            "financeiro.pago_em": new Date().toISOString(),
            "financeiro.metodo_detalhe": payment.payment_method_id
          });
          
          console.log(`✅ Pedido ${pedidoDoc.id} confirmado com sucesso.`);
        } else {
          console.log(`⚠️ Pedido com payment_id ${id} não encontrado no banco.`);
        }
      }
    }

    // SEMPRE retorne 200 ou 201 para o Mercado Pago não reenviar
    return NextResponse.json({ status: 'ok' }, { status: 200 });
    
  } catch (error) {
    console.error("❌ Erro no processamento do Webhook:", error);
    // Retornamos 200 mesmo no erro para evitar loop de tentativas do MP
    return NextResponse.json({ error: "Processed with error" }, { status: 200 });
  }
}