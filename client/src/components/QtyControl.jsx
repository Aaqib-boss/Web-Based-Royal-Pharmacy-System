import React from 'react';
import { Plus, Minus } from 'lucide-react';

const QtyControl = ({ value, onChange, min = 1, max = 9999 }) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleManualChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      if (val >= min && val <= max) {
        onChange(val);
      }
    } else if (e.target.value === '') {
      onChange('');
    }
  };

  const handleBlur = () => {
    if (value === '' || isNaN(value) || value < min) {
      onChange(min);
    }
  };

  return (
    <div className="flex items-center space-x-1 border border-slate-200 dark:border-white/5 bg-white dark:bg-darkBg-card rounded-xl p-1 w-max">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkBg-input disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <input
        type="text"
        value={value}
        onChange={handleManualChange}
        onBlur={handleBlur}
        className="w-12 text-center bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-800 dark:text-white font-semibold text-sm"
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkBg-input disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default QtyControl;
