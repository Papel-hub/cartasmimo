import { useState } from 'react';

export default function DeliveryCalendar({
  selectedDate,
  onDateSelect,
}: {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onDateSelect(date);
  };

  const isSameDay = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  return (
    <section className="mb-6">
      <h2 className="text-sm font-medium text-gray-800 mb-3">Escolha a data de entrega</h2>
      <div className="rounded-lg border border-gray-300 overflow-hidden">
        <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
          <span className="font-medium capitalize">{monthName} {year}</span>
          <div className="flex space-x-2">
            <button onClick={prevMonth} className="p-2 rounded-full border border-gray-200 hover:bg-gray-200" aria-label="Mês anterior">
              «
            </button>
            <button onClick={nextMonth} className="p-2 rounded-full border border-gray-200 hover:bg-gray-200" aria-label="Próximo mês">
              »
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 bg-gray-50 py-1">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {blankDays.map((_, i) => (
            <div key={`blank-${i}`} className="h-10"></div>
          ))}
          {days.map((day) => (
            <div
              key={day}
              onClick={() => handleDayClick(day)}
              className={`flex items-center justify-center rounded-full h-10 w-full text-sm font-medium cursor-pointer transition-colors
                ${isSameDay(day) ? 'bg-red-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}