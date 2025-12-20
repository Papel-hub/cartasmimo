// app/api/user/cartao/detalhes/route.ts
import { NextRequest } from 'next/server';
import { auth as adminAuth, db } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    // 1. Validar token de autenticação
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // 2. Buscar usuário no Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return new Response(JSON.stringify({ error: 'Usuário não encontrado' }), { status: 404 });
    }

    const userData = userDoc.data();
    const card = userData?.card;

    if (!card) {
      return new Response(JSON.stringify({ error: 'Cartão não encontrado' }), { status: 404 });
    }

    // 3. Verificar se os campos sensíveis existem
    const cardNumber = card.cardNumber || '';
    const validade = card.validade || '';
    const cvv = card.cvv || '';

    if (!cardNumber || !validade || !cvv) {
      return new Response(JSON.stringify({ error: 'Dados do cartão incompletos' }), { status: 400 });
    }

    // 4. Retornar dados sensíveis (somente porque é seu sistema virtual)
    return new Response(
      JSON.stringify({
        cardNumber,
        validade,
        cvv,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          // Opcional: adicionar cabeçalho de segurança
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  } catch (error) {
    console.error('Erro ao buscar detalhes sensíveis do cartão:', error);
    return new Response(JSON.stringify({ error: 'Falha ao carregar detalhes' }), { status: 500 });
  }
}