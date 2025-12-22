import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { cepDestino } = await req.json();
    const contrato = "9912726956";

    // 1. GERAÇÃO DO TOKEN
    const auth = Buffer.from(`${process.env.CORREIOS_USER}:${process.env.CORREIOS_PASS}`).toString("base64");
    
    const tokenRes = await fetch("https://api.correios.com.br/token/v1/autentica/contrato", {
      method: "POST",
      headers: { 
        "Authorization": `Basic ${auth}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ numero: contrato }) 
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      return NextResponse.json({ error: "Erro na autenticação", detalhes: errorText }, { status: 401 });
    }

    // LER O JSON APENAS UMA VEZ
    const tokenData = await tokenRes.json();
    const token = tokenData.token;

    // Log para conferir as permissões no terminal
    console.log("SISTEMAS LIBERADOS NESTE TOKEN:", tokenData.apis || "Nenhuma API listada");

    // 2. CÁLCULO DE PREÇO (Manual v3)
    const payload = {
      idLote: "001",
      parametrosProduto: [
        {
          coProduto: "03298", // PAC com contrato
          nuContrato: contrato,
          cepOrigem: "79080705",
          cepDestino: cepDestino.replace(/\D/g, ""),
          psObjeto: "300",     // Peso em gramas (mínimo recomendado para PAC)
          tpObjeto: "1",       
          comprimento: "20",
          largura: "15",
          altura: "10"
        }
      ]
    };

    const calcRes = await fetch("https://api.correios.com.br/preco/v3/nacional", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const result = await calcRes.json();
    
    // Log da resposta para depuração
    console.log("RESPOSTA DOS CORREIOS:", JSON.stringify(result, null, 2));

    // Se houver erro de permissão (GTW-012)
    if (result.msgs && result.msgs[0]?.includes("GTW-012")) {
      return NextResponse.json({ 
        valor: "---", 
        prazo: "API 34 Pendente de Liberação Comercial" 
      });
    }

    // Na v3 nacional, o retorno costuma ser uma lista dentro do objeto
    const dados = Array.isArray(result) ? result[0] : (result.parametrosProduto ? result.parametrosProduto[0] : result);

    return NextResponse.json({ 
      valor: dados.pcFinal || dados.pcExibir || "0,00",
      prazo: dados.prazoEntrega || "N/A"
    });

  } catch (error: any) {
    console.error("Erro crítico no servidor:", error.message);
    return NextResponse.json({ 
      error: "Erro de conexão", 
      detalhes: "O servidor dos Correios pode estar instável." 
    }, { status: 500 });
  }
}