import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { usuario, codigoAcesso } = await req.json();
  // Você poderia também pegar do env diretamente
  const user = usuario ?? process.env.CORREIOS_CWS_USUARIO;
  const code = codigoAcesso ?? process.env.CORREIOS_CWS_CODIGO_ACESSO;

  if (!user || !code) {
    return NextResponse.json({ error: "Credenciais CWS não configuradas" }, { status: 500 });
  }

  // Basic Auth
  const basic = Buffer.from(`${user}:${code}`).toString("base64");

  const tokenUrl = `${process.env.CORREIOS_CWS_BASE_URL}/token/v1/autentica/cartaopostagem`;

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basic}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({}) // conforme manual, pode ser body vazio ou outros campos dependendo da API
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Erro ao gerar token:", text);
      return NextResponse.json({ error: "Falha ao gerar token" }, { status: response.status });
    }

    const tokenData = await response.json();
    // tokenData costuma ter algo como { token: "...", expires_in: 86400 } — depende da API
    return NextResponse.json(tokenData);
  } catch (err) {
    console.error("Erro interno na rota token:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
