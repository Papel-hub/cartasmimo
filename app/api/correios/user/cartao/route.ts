// app/api/user/cartao/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth as adminAuth, db } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    // ✅ Verifica header Authorization
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // ✅ Busca o usuário no Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const userData = userDoc.data();
    const card = userData?.card;

    // ✅ Se não tiver cartão, retorna hasCartao false
    if (!card) {
      return NextResponse.json({ hasCartao: false }, { status: 200 });
    }

    // ✅ Retorna dados do cartão corretamente mapeados
    return NextResponse.json({
      hasCartao: true,
      id: uid,
      nome: userData.name || 'Usuário',
      cardNumber: card.number || '', // <--- aqui é o campo correto do Firestore
      validade: card.validade,       // já existe no Firestore
      cvv: card.cvv,                 // já existe no Firestore
      transacoes: Array.isArray(card.transacoes) ? card.transacoes : [],
    });
  } catch (error) {
    console.error('Erro ao buscar cartão:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
