'use client';

import React from 'react';
import { Mail } from "lucide-react";



export default function BtnCoracao({ onClick }: { onClick?: () => void }) {
  return (
    <div className="relative flex justify-center">
      <button
        onClick={onClick}
        className="w-full font-semibold border border-red-900 text-white py-3 rounded-lg hover:bg-red-800
        bg-red-900 transition flex justify-center items-center gap-2"
      ><Mail className=" h-5 w-5 " />
        Carta do Coração
      </button>
    </div>
  );
}
