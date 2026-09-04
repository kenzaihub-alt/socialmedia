import React from 'react';
import ProductLeadForm from './components/ProductLeadForm';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-indigo-50/40 text-slate-900 flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-x-hidden">
      {/* Soft ambient background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-indigo-200/30 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-sky-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-violet-200/25 rounded-full blur-3xl pointer-events-none" />

      {/* Main Single Form */}
      <main className="w-full relative z-10 my-auto py-6">
        <ProductLeadForm />
      </main>
    </div>
  );
}
