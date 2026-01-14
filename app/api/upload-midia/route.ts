'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebaseConfig';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import ConnectionStatus from "@/components/ConnectionStatus";
import Sidebar from '@/components/Sidebar';
import { FaHome, FaUpload, FaTrash, FaImages } from "react-icons/fa";

export default function AdminPanel() {
  const [limiteCards, setLimiteCards] = useState(4);
  const [banners, setBanners] = useState<{ id: string, imageUrl: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  // 1. Carregar Dados Iniciais
  useEffect(() => {
    const loadData = async () => {
      try {
        // Carrega Limite de Cards
        const configRef = doc(db, 'configuracoes', 'home');
        const configSnap = await getDoc(configRef);
        if (configSnap.exists()) setLimiteCards(configSnap.data().limiteCards);

        // Carrega Banners
        const bannerSnap = await getDocs(collection(db, 'banners'));
        setBanners(bannerSnap.docs.map(d => ({ id: d.id, imageUrl: d.data().imageUrl })));
      } catch (error) {
        console.error("Erro ao carregar:", error);
      }
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    if (confirm("Sair do sistema?")) {
      const auth = getAuth();
      await signOut(auth);
      window.location.href = "/login";
    }
  };

  // 2. Salvar Limite de Cards no Firestore
  const saveLimit = async () => {
    try {
      await setDoc(doc(db, 'configuracoes', 'home'), { limiteCards });
      alert("Configuração salva!");
    } catch (err) {
      alert("Erro ao salvar limite.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('video', file); 

    try {
      // Faz o upload para a SUA API (Ajuste o caminho se necessário)
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        // No seu exemplo, a API retorna 'videoPath'
        const imageUrl = data.videoPath; 

        // Salva a URL retornada no Firestore para a Home ler
        const docRef = await addDoc(collection(db, 'banners'), { 
          imageUrl, 
          active: true,
          createdAt: new Date()
        });

        setBanners(prev => [...prev, { id: docRef.id, imageUrl }]);
        alert("Banner enviado com sucesso!");
      } else {
        throw new Error(data.error || 'Erro na API');
      }
    } catch (error) {
      console.error(error);
      alert("Falha no upload para a VPS.");
    } finally {
      setUploading(false);
      e.target.value = ''; // Reseta o input de arquivo
    }
  };

  const deleteBanner = async (id: string) => {
    if (confirm("Remover este banner?")) {
      await deleteDoc(doc(db, 'banners', id));
      setBanners(prev => prev.filter(b => b.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar onLogout={handleLogout} />

      <main className="ml-64 flex-1 p-8">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Gerenciar Home</h1>
            <p className="text-slate-500 text-sm">Controle banners e exibição de produtos</p>
          </div>
          <ConnectionStatus />
        </header>

        <div className="max-w-5xl space-y-8">
          
          {/* CONFIGURAÇÃO DE QUANTIDADE */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
               <FaImages className="text-red-900" /> Limite de Exibição
            </h2>
            <div className="flex items-center gap-4">
              <label className="text-sm text-slate-600">Cards visíveis na Home:</label>
              <input 
                type="number" 
                value={limiteCards} 
                onChange={(e) => setLimiteCards(Number(e.target.value))}
                className="w-20 p-2 border rounded-lg focus:ring-2 focus:ring-red-900 outline-none"
              />
              <button onClick={saveLimit} className="bg-red-900 text-white px-6 py-2 rounded-lg hover:bg-red-800">
                Atualizar
              </button>
            </div>
          </section>

          {/* GERENCIAMENTO DE BANNERS */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
               <FaUpload className="text-red-900" /> Banners do Carrossel
            </h2>

            <div className="mb-8">
              <label className="relative cursor-pointer bg-red-50 border-2 border-dashed border-red-200 p-8 rounded-xl block text-center hover:bg-red-100 transition-colors">
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                  disabled={uploading}
                  accept="image/*"
                />
                <FaUpload className="mx-auto text-red-900 mb-2 text-xl" />
                <span className="text-red-900 font-medium">
                  {uploading ? "Enviando para VPS..." : "Clique para selecionar novo banner"}
                </span>
                <p className="text-xs text-red-700/60 mt-1">Imagens enviadas para cartasdamimo.com/uploads</p>
              </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {banners.map(banner => (
                <div key={banner.id} className="relative aspect-video group rounded-lg overflow-hidden border">
                  <img src={banner.imageUrl} className="w-full h-full object-cover" alt="Banner" />
                  <button 
                    onClick={() => deleteBanner(banner.id)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}