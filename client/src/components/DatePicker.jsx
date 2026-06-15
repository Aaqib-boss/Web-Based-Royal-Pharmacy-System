import React, { forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';

const DatePicker = ({ selected, onChange }) => {
  const CustomInput = forwardRef(({ value, onClick }, ref) => (
    <button
      type="button"
      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-darkBg-card text-slate-800 dark:text-slate-100 hover:border-primary/50 focus-glow transition-all duration-200 text-left text-sm"
      onClick={onClick}
      ref={ref}
    >
      <span>{value || 'Select Date'}</span>
      <Calendar className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
    </button>
  ));

  return (
    <div className="relative w-full">
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        dateFormat="yyyy-MM-dd"
        customInput={<CustomInput />}
        maxDate={new Date()}
      />
    </div>
  );
};

export default DatePicker;
