import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const [placeAbove, setPlaceAbove] = useState(false);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inAnchor = ref.current && ref.current.contains(target);
      const inMenu = menuRef.current && menuRef.current.contains(target);
      if (!inAnchor && !inMenu) setIsOpen(false);
    };

    const recomputePosition = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const shouldPlaceAbove = spaceBelow < 200 && rect.top > 200;
      setPlaceAbove(shouldPlaceAbove);
      setMenuStyle({
        position: 'fixed',
        top: shouldPlaceAbove ? rect.top : rect.bottom,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8)),
        width: rect.width,
      });
    };
    const handleScrollClose = () => {
      // Cierra el menú si se desplaza el contenedor de la tabla
      setIsOpen(false);
    };
    const findScrollParent = (el: HTMLElement | null): HTMLElement | Window => {
      let parent = el?.parentElement || null;
      while (parent) {
        const style = getComputedStyle(parent);
        const overflowY = style.overflowY;
        const canScrollY = (overflowY === 'auto' || overflowY === 'scroll') && parent.scrollHeight > parent.clientHeight;
        if (canScrollY) return parent;
        parent = parent.parentElement;
      }
      return window;
    };
    let anchorScrollEl: HTMLElement | Window | null = null;

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', recomputePosition);
    if (isOpen) {
      // Reposicionar al abrir
      recomputePosition();
      // Cerrar solo cuando se hace scroll en el contenedor de la tabla (scroll parent del anchor)
      anchorScrollEl = findScrollParent(ref.current);
      anchorScrollEl.addEventListener('scroll', handleScrollClose as EventListener, { passive: true } as any);
      // En móviles, cierre si se arrastra para desplazar el contenedor de la tabla
      anchorScrollEl.addEventListener('touchmove', handleScrollClose as EventListener, { passive: true } as any);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', recomputePosition);
      if (anchorScrollEl) {
        anchorScrollEl.removeEventListener('scroll', handleScrollClose as EventListener);
        anchorScrollEl.removeEventListener('touchmove', handleScrollClose as EventListener);
      }
    };
  }, [isOpen]);

  return (
    <div className={cn('grid w-full items-center gap-2', className)}>
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

        {isOpen && createPortal(
          <div
            ref={menuRef}
            style={{ ...menuStyle, transform: placeAbove ? 'translateY(-4px) translateY(-100%)' : 'translateY(4px)' }}
            className="z-[80] bg-slate-800 border border-slate-600 rounded-md shadow-xl max-h-60 overflow-auto"
          >
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
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};
