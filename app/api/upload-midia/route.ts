import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Configurações de diretório
const UPLOAD_DIR = '/var/www/uploads'; 
const PUBLIC_BASE_URL = 'https://cartasdamimo.com/uploads';

export async function POST(request: NextRequest) {
  console.log('--- INICIANDO UPLOAD ---');
  
  try {
    const formData = await request.formData();
    // Armazena os links gerados apenas para arquivos válidos
    const results: Record<string, string> = {};

    // 1. Garantir que a pasta de destino existe
    if (!existsSync(UPLOAD_DIR)) {
      console.log('Diretório não existe. Tentando criar...');
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // 2. Iterar sobre os campos do formulário
    for (const [key, value] of formData.entries()) {
      
      // Verifica se o campo é um arquivo (Blob/File)
      if (value instanceof Blob) {
        
        // --- TRAVA CRUCIAL: Ignora se o arquivo estiver vazio (0 bytes) ---
        if (value.size === 0) {
          console.log(`⚠️ Campo "${key}" recebido, mas está vazio. Pulando...`);
          continue; 
        }

        const buffer = Buffer.from(await value.arrayBuffer());
        
        // Segunda trava: Garante que o buffer tem conteúdo
        if (buffer.length === 0) {
          console.log(`⚠️ Buffer do campo "${key}" está vazio. Pulando...`);
          continue;
        }

        // Define extensão e nome único
        const extension = value.type?.split('/')[1] || 'webm';
        const fileName = `mimo-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
        const filePath = path.resolve(UPLOAD_DIR, fileName);

        console.log(`💾 Salvando ${key}: ${fileName} (${value.size} bytes)`);

        // Escreve o arquivo no disco
        await writeFile(filePath, buffer);
        
        // Verifica se a escrita foi bem sucedida antes de gerar a URL
        if (existsSync(filePath)) {
          results[key] = `${PUBLIC_BASE_URL}/${fileName}`;
          console.log(`✅ ${key} salvo com sucesso.`);
        }
      }
    }

    // 3. Retorno da API
    // Se results['audio'] não existir (porque foi pulado), retornará null.
    return NextResponse.json({
      success: true,
      audioPath: results['audio'] || null,
      videoPath: results['video'] || null,
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('--- FALHA NO UPLOAD ---');
    console.error('Erro detalhado:', error);
    
    return NextResponse.json(
      { success: false, error: msg }, 
      { status: 500 }
    );
  }
}