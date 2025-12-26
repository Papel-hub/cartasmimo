"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function DocPage() {
  const docs = [
    {
      title: "Política de Privacidade",
      file: "/docs/politica-privacidade.pdf",
    },
    {
      title: "Termos de Uso e Condições",
      file: "/docs/termos-uso.pdf",
    },
    {
      title: "Política de Consumo de Bebidas Alcoólicas",
      file: "/docs/politica-bebidas.pdf",
    },
    {
      title: "Regras de Vendas e Entregas",
      file: "/docs/regras-entregas.pdf",
    },    
    {
      title: "Direitos de Texto, Imagem, Audio e Video",
      file: "/docs/direitos.pdf",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow sm:px-16 px-8 pt-24 pb-8 sm:pt-28 sm:pb-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-red-900 mb-6">Documentos Legais</h1>

        <p className="text-gray-700 mb-8">
          Aqui você encontra todos os documentos oficiais relacionados ao uso e
          funcionamento da plataforma <strong>Mimo Meu e Seu</strong>.
        </p>

        <div className="space-y-4">
          {docs.map((doc, index) => (
            <Link
              key={index}
              href={doc.file}
              target="_blank"
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-red-50 transition"
            >
              <div className="flex items-center gap-3">
                <FileText className="text-red-900" />
                <span className="font-medium text-gray-900">{doc.title}</span>
              </div>
              <span className="text-red-900 font-semibold">Abrir PDF</span>
            </Link>
          ))}
        </div>
      </div>
      </main>
         
      <Footer />
    </div>
  );
}
