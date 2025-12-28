'use client';

import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface DeliveryCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

export default function DeliveryCalendar({
  selectedDate,
  onDateSelect,
}: DeliveryCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Data atual para bloqueio de dias passados
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthName = currentMonth.toLocaleString('pt-BR', { month: 'long' });
  const year = currentMonth.getFullYear();

  const blankDays = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    // 🚫 Não permite selecionar datas antes de hoje
    if (clickedDate < today) return;
    
    onDateSelect(clickedDate);
  };

const isSelected = (day: number) => {
  if (!selectedDate) return false;
  
  // Criamos um objeto Date da data selecionada para comparar apenas dia/mês/ano
  const sel = new Date(selectedDate);
  
  return (
    sel.getDate() === day &&
    sel.getMonth() === currentMonth.getMonth() &&
    sel.getFullYear() === currentMonth.getFullYear()
  );
};

  const isPast = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return d < today;
  };

  const isToday = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return d.getTime() === today.getTime();
  };

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-gray-800">Data de entrega/envio</h2>
      
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Header do Calendário */}
        <div className="flex items-center justify-between p-4 bg-gray-50/50 border-b border-gray-100">
          <span className="font-bold text-gray-700 capitalize">
            {monthName} <span className="text-gray-400 font-normal">{year}</span>
          </span>
          <div className="flex gap-1">
            <button 
              onClick={prevMonth} 
              className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all text-gray-600"
              aria-label="Mês anterior"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={nextMonth} 
              className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all text-gray-600"
              aria-label="Próximo mês"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Dias da Semana */}
        <div className="grid grid-cols-7 text-center py-2 border-b border-gray-50">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Grade de Dias */}
        <div className="grid grid-cols-7 p-1">
          {blankDays.map((_, i) => (
            <div key={`blank-${i}`} className="aspect-square" />
          ))}
          
          {days.map((day) => {
            const past = isPast(day);
            const selected = isSelected(day);
            const todayMark = isToday(day);

            return (
              <button
                key={day}
                disabled={past}
                onClick={() => handleDayClick(day)}
                className={`
                  relative aspect-square flex flex-col items-center justify-center text-sm font-medium transition-all rounded-full
                  ${past ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-red-50 hover:text-red-900'}
                  ${selected ? 'bg-red-900 text-white hover:bg-red-900 hover:text-white shadow-md shadow-red-900/20' : ''}
                `}
              >
                {day}
                {todayMark && !selected && (
                  <span className="absolute bottom-1.5 h-1 w-3 bg-red-900 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {selectedDate && (
        <p className="text-[11px] text-gray-500 text-center italic">
          Data selecionada: {new Date(selectedDate).toLocaleDateString('pt-BR')}
        </p>
      )}
    </section>
  );
}