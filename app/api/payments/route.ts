import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";

// ✅ Inicializa cliente Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

// ✅ Tipos seguros
interface Identification {
  type: string;
  number: string;
}

interface PaymentRequestBody {
  amount: number | string;
  email: string;
  description: string;
  method: "pix" | "credit_card" | "debit_card" | "boleto";
  token?: string;
  installments?: number;
  identification?: Identification;
  first_name?: string;
  last_name?: string;
  payment_method_id?: string;
}

// ✅ Tipagem genérica segura para respostas de erro
interface BasicError {
  message?: string;
  name?: string;
  stack?: string;
}

// ✅ Type guards (sem any)
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasMessage(error: unknown): error is { message: string } {
  return isObject(error) && typeof (error as Record<string, unknown>).message === "string";
}

function hasName(error: unknown): error is { name: string } {
  return isObject(error) && typeof (error as Record<string, unknown>).name === "string";
}

// ✅ Função principal
export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  try {
    const body: PaymentRequestBody = await req.json();
    const {
      amount,
      email,
      description,
      method,
      token,
      installments = 1,
      identification,
      first_name,
      last_name,
      payment_method_id,
    } = body;

    // 🧩 Validações
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ success: false, error: "Email inválido." }, { status: 400 });

    const amountNum = Number(parseFloat(String(amount)).toFixed(2));
    if (isNaN(amountNum) || amountNum < 1)
      return NextResponse.json({ success: false, error: "Valor inválido." }, { status: 400 });

    if (!["pix", "credit_card", "debit_card", "boleto"].includes(method))
      return NextResponse.json({ success: false, error: "Método de pagamento inválido." }, { status: 400 });

    const paymentClient = new Payment(client);

    // 💰 PIX
    if (method === "pix") {
      const payment = await paymentClient.create({
        body: {
          transaction_amount: amountNum,
          description,
          payment_method_id: "pix",
          payer: { email },
        },
      });

    const qrData = payment.point_of_interaction?.transaction_data;

if (qrData) {
  // Fazemos um cast leve e seguro para incluir o campo extra "expiration_date"
  const qrDataExtended = qrData as typeof qrData & { expiration_date?: string };

  return NextResponse.json({
    success: true,
    data: {
      id: payment.id,
      qr_code_base64: qrDataExtended.qr_code_base64,
      qr_code: qrDataExtended.qr_code,
      expiration_date: qrDataExtended.expiration_date, // agora sem erro de tipo
      status: payment.status,
    },
  });
}

throw new Error("Falha ao gerar QR Code.");

    }

    // 💳 Cartão de crédito ou débito
    if (method === "credit_card" || method === "debit_card") {
      if (!token || !identification)
        return NextResponse.json(
          { success: false, error: "Token e identificação obrigatórios para pagamento com cartão." },
          { status: 400 }
        );

      const payment = await paymentClient.create({
        body: {
          transaction_amount: amountNum,
          token,
          installments,
          description,
          payment_method_id:
            payment_method_id || (method === "credit_card" ? "visa" : "debit_card"),
          payer: { email, identification },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: payment.id,
          status: payment.status,
          status_detail: payment.status_detail,
          payment_method_id: payment.payment_method_id,
        },
      });
    }

    // 🧾 Boleto
    if (method === "boleto") {
      if (!first_name || !last_name || !identification)
        return NextResponse.json(
          { success: false, error: "Nome e documento obrigatórios para boleto." },
          { status: 400 }
        );

      const payment = await paymentClient.create({
        body: {
          transaction_amount: amountNum,
          description,
          payment_method_id: payment_method_id || "bolbradesco",
          payer: {
            email,
            first_name,
            last_name,
            identification,
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: payment.id,
          status: payment.status,
          status_detail: payment.status_detail,
          boleto_url: payment.transaction_details?.external_resource_url ?? null,
        },
      });
    }

    throw new Error("Método de pagamento não suportado.");
  } catch (error: unknown) {
    
    let message = "Erro desconhecido.";

    if (hasMessage(error)) {
      message = error.message;
    } else if (hasName(error)) {
      message = `Erro: ${error.name}`;
    }

    const safeError: BasicError = isObject(error)
      ? {
          message: hasMessage(error) ? error.message : undefined,
          name: hasName(error) ? error.name : undefined,
          stack: typeof (error as Record<string, unknown>).stack === "string"
            ? (error as Record<string, string>).stack
            : undefined,
        }
      : {};

    console.error(`[${requestId}] ❌ Erro no /api/payments:`, safeError);

    return NextResponse.json(
      { success: false, error: message || "Falha ao processar o pagamento." },
      { status: 500 }
    );
  }
}
