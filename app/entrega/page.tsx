'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import EntregaForm from './components/EntregaForm';

export default function EntregaPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow sm:px-16 px-8 pt-24 pb-8 sm:pt-28 sm:pb-12">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Tipos de entrega</h1>
        <EntregaForm />
      </main>
      <Footer />
    </div>
  );
}