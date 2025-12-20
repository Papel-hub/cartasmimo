import { NextResponse } from "next/server";

// Função utilitária de delay
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Função que tenta chamar o CWS com retries
async function fetchCwsWithRetry(url: string, options: RequestInit, retries = 3, backoff = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);

      if (res.status === 503) {
        // Serviço indisponível, vamos tentar de novo
        console.warn(`CWS indisponível, tentativa ${i + 1}/${retries}`);
        await delay(backoff * (i + 1)); // delay exponencial simples
        continue;
      }

      const json = await res.json();
      return { status: res.status, data: json };
    } catch (err) {
      console.error("Erro ao chamar CWS:", err);
      if (i < retries - 1) {
        await delay(backoff * (i + 1));
      } else {
        throw err;
      }
    }
  }

  // Se todas as tentativas falharem
  return {
    status: 503,
    data: { mensagem: "Serviço dos Correios indisponível após várias tentativas" }
  };
}

export async function POST(req: Request) {
  try {
    const { objetos } = await req.json();

    if (!process.env.CWS_TOKEN) {
      return NextResponse.json(
        { error: "CWS_TOKEN não configurado no .env" },
        { status: 500 }
      );
    }

    const url = "https://api.correios.com.br/cws/v1/rastreamento/objetos";

    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CWS_TOKEN}`
      },
      body: JSON.stringify({ objetos })
    };

    const result = await fetchCwsWithRetry(url, options, 3, 1000);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Erro interno na rota:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
