import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/* =========================
   CONSTANTES
========================= */

const UPLOAD_DIR = '/var/www/uploads';
const PUBLIC_BASE_URL = 'https://cartasdamimo.com/uploads';

/* =========================
   HANDLER
========================= */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'Arquivo não encontrado ou inválido' },
        { status: 400 }
      );
    }

    /* =========================
       CONVERSÃO PARA BUFFER
    ========================== */

    const buffer = Buffer.from(await file.arrayBuffer());

    /* =========================
       GARANTE DIRETÓRIO
    ========================== */

    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    /* =========================
       NOME DO FICHEIRO
    ========================== */

    const extension =
      file.type?.split('/')[1] && file.type !== 'application/octet-stream'
        ? file.type.split('/')[1]
        : 'webm';

    const fileName = `mimo-${Date.now()}-${crypto
      .randomUUID()
      .slice(0, 8)}.${extension}`;

    const filePath = path.join(UPLOAD_DIR, fileName);

    /* =========================
       ESCRITA NO DISCO
    ========================== */

    await writeFile(filePath, buffer);

    /* =========================
       RESPOSTA
    ========================== */

    return NextResponse.json({
      url: `${PUBLIC_BASE_URL}/${fileName}`,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Erro desconhecido';

    console.error('Erro no upload:', message);

    return NextResponse.json(
      { error: 'Falha ao salvar o arquivo' },
      { status: 500 }
    );
  }
}
