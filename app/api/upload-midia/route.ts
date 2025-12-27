import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Tenta usar o caminho da Hostinger, se falhar, usa uma pasta dentro do projeto
const UPLOAD_DIR = '/var/www/uploads'; 
const PUBLIC_BASE_URL = 'https://cartasdamimo.com/uploads';

export async function POST(request: NextRequest) {
  console.log('--- INICIANDO UPLOAD ---');
  try {
    const formData = await request.formData();
    const results: Record<string, string> = {};

    // 1. Log de Verificação de Pasta
    console.log(`Verificando diretório: ${UPLOAD_DIR}`);
    if (!existsSync(UPLOAD_DIR)) {
      console.log('Diretório não existe. Tentando criar...');
      await mkdir(UPLOAD_DIR, { recursive: true });
      console.log('Diretório criado com sucesso.');
    }

    for (const [key, value] of formData.entries()) {
      if (value instanceof Blob) {
        const buffer = Buffer.from(await value.arrayBuffer());
        const extension = value.type?.split('/')[1] || 'webm';
        const fileName = `mimo-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
        
        // 2. Log do Caminho do Arquivo
        const filePath = path.resolve(UPLOAD_DIR, fileName);
        console.log(`Tentando salvar arquivo ${key} em: ${filePath}`);
        console.log(`Tamanho do buffer: ${buffer.length} bytes`);

        await writeFile(filePath, buffer);
        
        // Verificação imediata após escrita
        if (existsSync(filePath)) {
          console.log(`✅ SUCESSO: Arquivo confirmado no disco: ${fileName}`);
          results[key] = `${PUBLIC_BASE_URL}/${fileName}`;
        } else {
          console.error(`❌ ERRO: O arquivo deveria estar lá, mas não foi encontrado após writeFile.`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      audioPath: results['audio'] || null,
      videoPath: results['video'] || null,
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('--- FALHA NO UPLOAD ---');
    console.error('Erro detalhado:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}