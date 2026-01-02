import { NextResponse } from 'next/server';

/* =========================
    INTERFACES TÉCNICAS
========================= */
interface PrecoProdutoResponse {
  pcFinal: string;
  txErro?: string;
}

interface PrazoProdutoResponse {
  prazoEntrega?: number;
  txErro?: string;
}

/* =========================
    HANDLER DA API
========================= */
export async function POST(req: Request) {
  try {
    const { cepDestino } = await req.json();
    if (!cepDestino) return NextResponse.json({ error: 'CEP obrigatório' }, { status: 400 });

    const cleanCep = cepDestino.replace(/\D/g, '');
    const CARTAO_POSTAGEM = '0079835201';
    const CEP_ORIGEM = '79080705';
    const COD_PAC = '03298';

    // 1. AUTENTICAÇÃO
    const auth = Buffer.from(`${process.env.CORREIOS_USER}:${process.env.CORREIOS_PASS}`).toString('base64');
    const tokenRes = await fetch('https://api.correios.com.br/token/v1/autentica/cartaopostagem', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ numero: CARTAO_POSTAGEM }),
    });
    
    const tokenData = await tokenRes.json();
    const { token } = tokenData;
    const { contrato, dr } = tokenData.cartaoPostagem;

    // 2. CONSULTA DE PREÇO E PRAZO EM PARALELO (Otimiza o tempo de resposta)
    const [precoRes, prazoRes] = await Promise.all([
      fetch('https://api.correios.com.br/preco/v1/nacional', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idLote: "01",
          parametrosProduto: [{
            coProduto: COD_PAC,
            nuRequisicao: "01",
            nuContrato: contrato,
            nuDR: dr.toString(),
            cepOrigem: CEP_ORIGEM,
            cepDestino: cleanCep,
            psObjeto: "300",
            tpObjeto: "1",
            comprimento: "20",
            largura: "15",
            altura: "10"
          }]
        }),
      }),
      fetch('https://api.correios.com.br/prazo/v1/nacional', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idLote: "01",
          parametrosPrazo: [{
            coProduto: COD_PAC,
            nuRequisicao: "01",
            cepOrigem: CEP_ORIGEM,
            cepDestino: cleanCep,
            dataPostagem: new Date().toISOString().split('T')[0]
          }]
        }),
      })
    ]);

    const precoData = await precoRes.json();
    const prazoData = await prazoRes.json();

    // 3. EXTRAÇÃO DOS RESULTADOS
    const infoPreco: PrecoProdutoResponse = Array.isArray(precoData) ? precoData[0] : precoData.parametrosProduto[0];
    const infoPrazo: PrazoProdutoResponse = Array.isArray(prazoData) ? prazoData[0] : (prazoData.parametrosPrazo?.[0]);

    if (infoPreco.txErro || !infoPreco.pcFinal) {
      return NextResponse.json({ valor: 0, prazo: infoPreco.txErro || 'Serviço indisponível' });
    }

    const valorNumerico = parseFloat(infoPreco.pcFinal.replace(',', '.'));
    const prazoFinal = infoPrazo?.prazoEntrega 
      ? `${infoPrazo.prazoEntrega} dias úteis` 
      : "5 a 12 dias úteis";

    return NextResponse.json({
      valor: valorNumerico,
      valorFormatado: `R$ ${infoPreco.pcFinal}`,
      prazo: prazoFinal,
      servico: 'PAC'
    });

  } catch (error) {
    console.error('Erro na rota de frete:', error);
    return NextResponse.json({ error: 'Erro interno ao processar frete' }, { status: 500 });
  }
}