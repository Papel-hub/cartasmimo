import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { db } from '../../../../lib/firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('data.id') || url.searchParams.get('id');
    const type = url.searchParams.get('type');

    // O Mercado Pago envia notificações de vários tipos, queremos apenas 'payment'
    if (type === 'payment' && id) {
      const paymentClient = new Payment(client);
      const payment = await paymentClient.get({ id });

      // Se o status for 'approved', buscamos o pedido no Firebase
      if (payment.status === 'approved') {
        const pedidosRef = collection(db, "pedidos");
        const q = query(pedidosRef, where("payment_id", "==", Number(id)));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const pedidoDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, "pedidos", pedidoDoc.id), {
            status: "pago",
            pago_em: new Date().toISOString(),
            metodo_confirmado: payment.payment_method_id
          });
          console.log(`✅ Pedido ${pedidoDoc.id} atualizado para PAGO.`);
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Erro no Webhook:", error);
    // Retornamos 200 mesmo no erro para o Mercado Pago não ficar tentando reenviar infinitamente
    return NextResponse.json({ error: "Internal Error" }, { status: 200 });
  }
}