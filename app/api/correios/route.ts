import { NextResponse } from 'next/server';

/* =========================
   TIPOS
========================= */

type TokenResponse = {
  token: string;
  apis?: string[];
};

type CorreiosMensagem = {
  msgs?: string[];
};

type PrecoProduto = {
  pcFinal?: string;
  pcExibir?: string;
  prazoEntrega?: string;
};

type PrecoResponse =
  | CorreiosMensagem
  | { parametrosProduto?: PrecoProduto[] }
  | PrecoProduto[];

/* =========================
   HELPERS
========================= */

function extrairPreco(
  result: PrecoResponse
): PrecoProduto | undefined {
  if (Array.isArray(result)) {
    return result[0];
  }

  if ('parametrosProduto' in result) {
    return result.parametrosProduto?.[0];
  }

  return undefined;
}

/* =========================
   HANDLER
========================= */

export async function POST(req: Request) {
  try {
    const body: { cepDestino?: string } = await req.json();

    if (!body.cepDestino) {
      return NextResponse.json(
        { error: 'CEP de destino é obrigatório' },
        { status: 400 }
      );
    }

    const cepDestino = body.cepDestino.replace(/\D/g, '');
    const contrato = '9912726956';

    /* =========================
       1. AUTENTICAÇÃO
    ========================== */

    const auth = Buffer.from(
      `${process.env.CORREIOS_USER}:${process.env.CORREIOS_PASS}`
    ).toString('base64');

    const tokenRes = await fetch(
      'https://api.correios.com.br/token/v1/autentica/contrato',
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ numero: contrato }),
      }
    );

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      return NextResponse.json(
        { error: 'Erro na autenticação', detalhes: errorText },
        { status: 401 }
      );
    }

    const tokenData: TokenResponse = await tokenRes.json();
    const token = tokenData.token;

    console.log(
      'APIs liberadas no token:',
      tokenData.apis ?? 'Nenhuma'
    );

    /* =========================
       2. CÁLCULO DE FRETE
    ========================== */

    const payload = {
      idLote: '001',
      parametrosProduto: [
        {
          coProduto: '03298', // PAC contrato
          nuContrato: contrato,
          cepOrigem: '79080705',
          cepDestino,
          psObjeto: '300',
          tpObjeto: '1',
          comprimento: '20',
          largura: '15',
          altura: '10',
        },
      ],
    };

    const calcRes = await fetch(
      'https://api.correios.com.br/preco/v3/nacional',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const result: PrecoResponse = await calcRes.json();

    console.log(
      'RESPOSTA CORREIOS:',
      JSON.stringify(result, null, 2)
    );

    /* =========================
       3. ERROS DE PERMISSÃO
    ========================== */

    if (
      'msgs' in result &&
      result.msgs?.[0]?.includes('GTW-012')
    ) {
      return NextResponse.json({
        valor: '---',
        prazo: 'API 34 pendente de liberação comercial',
      });
    }

    /* =========================
       4. EXTRAÇÃO SEGURA
    ========================== */

    const dados = extrairPreco(result);

    return NextResponse.json({
      valor: dados?.pcFinal ?? dados?.pcExibir ?? '0,00',
      prazo: dados?.prazoEntrega ?? 'N/A',
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Erro desconhecido';

    console.error('Erro crítico:', message);

    return NextResponse.json(
      {
        error: 'Erro de conexão',
        detalhes:
          'O servidor dos Correios pode estar instável.',
      },
      { status: 500 }
    );
  }
}
