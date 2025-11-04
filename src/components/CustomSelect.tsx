import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';

type Option = {
  value: string;
  label: string;
  iconSrc?: string;
};

type CustomSelectProps = {
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
};

export const CustomSelect = ({
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
  className,
  label,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={cn('grid w-full items-center gap-3', className)}>
      {label && <label className="text-xs font-medium text-slate-300">{label}</label>}
      <div className="relative w-full" ref={ref}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-10 w-full truncate flex items-center justify-between px-3 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#f89320a9]"
        >
          <span className="flex items-center gap-2 truncate">
            {selectedOption?.iconSrc && (
              <img src={selectedOption.iconSrc} alt="icono" className="w-5 h-5 object-contain" />
            )}
            <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          </span>
          <svg
            className={`w-4 h-4 ml-2 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onValueChange(option.value);
                  setIsOpen(false);
                }}
                className="px-3 py-2 text-white hover:bg-slate-700 cursor-pointer flex items-center gap-2"
              >
                {option.iconSrc && (
                  <img src={option.iconSrc} alt="icono" className="w-5 h-5 object-contain" />
                )}
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
