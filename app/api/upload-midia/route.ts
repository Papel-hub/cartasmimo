import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    const videoFile = formData.get('video') as File | null;

    // Caminho onde os arquivos serão salvos na sua VPS
    // Usando 'public/uploads' para facilitar o acesso via URL
    const uploadDir = join(process.cwd(), 'public', 'uploads');

    // Cria a pasta se ela não existir
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const savedFiles: { audioPath?: string; videoPath?: string } = {};

    // Processar Áudio
    if (audioFile) {
      const bytes = await audioFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `audio_${Date.now()}.webm`;
      const path = join(uploadDir, fileName);
      await writeFile(path, buffer);
      savedFiles.audioPath = `/uploads/${fileName}`;
    }

    // Processar Vídeo
    if (videoFile) {
      const bytes = await videoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `video_${Date.now()}.webm`;
      const path = join(uploadDir, fileName);
      await writeFile(path, buffer);
      savedFiles.videoPath = `/uploads/${fileName}`;
    }

    return NextResponse.json({ 
      success: true, 
      ...savedFiles 
    });

  } catch (error) {
    console.error('Erro no upload na VPS:', error);
    return NextResponse.json({ error: 'Erro ao salvar arquivo no servidor' }, { status: 500 });
  }
}