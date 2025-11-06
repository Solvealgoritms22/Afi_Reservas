import React, {createContext, useContext, useEffect, useRef, useState} from 'react'
type Ctx = {value: string, setValue: (v:string)=>void}
const TabsCtx = createContext<Ctx | null>(null)
export const Tabs: React.FC<{defaultValue: string, className?: string, children: React.ReactNode}> = ({defaultValue, className='', children}) => {
  const [value, setValue] = useState(defaultValue)
  return <div className={className}><TabsCtx.Provider value={{value, setValue}}>{children}</TabsCtx.Provider></div>
}
export const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({className='', children, ...p}) => {
  const ctx = useContext(TabsCtx)!
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Detectar triggers (cualquier hijo válido con prop `value`) con tipado estricto
  type TriggerEl = React.ReactElement<{ value: string; children: React.ReactNode }>
  const isTriggerEl = (ch: unknown): ch is TriggerEl => {
    return React.isValidElement(ch) && typeof (ch as any).props?.value === 'string'
  }
  const triggers: TriggerEl[] = React.Children.toArray(children).filter(isTriggerEl)
  const active = triggers.find(tr => tr.props.value === ctx.value) ?? triggers[0]

  return (
    <>
      {/* Desktop/Tablet: botones */}
      <div
        className={`hidden md:inline-flex max-w-[26.5rem] w-full flex-wrap md:flex-nowrap gap-1 overflow-x-auto rounded-xl border border-slate-700 bg-slate-800 p-1 ${className}`}
        {...p}
      >
        {children}
      </div>
      {/* Móvil: dropdown personalizado */}
      <div className="md:hidden relative" ref={ref}>
        <button
          onClick={() => setOpen(o => !o)}
          className="h-10 w-full flex items-center justify-between px-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
        >
          <span className="flex items-center gap-2">{active?.props.children}</span>
          <svg
            className={`w-4 h-4 ml-2 transition-transform ${open ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="absolute left-0 right-0 z-50 mt-1 w-full max-h-56 overflow-auto bg-slate-800 border border-slate-700 rounded-xl shadow-xl">
            {triggers.map(tr => (
              <button
                key={tr.props.value}
                onClick={() => { ctx.setValue(tr.props.value); setOpen(false) }}
                className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-700 flex items-center gap-2"
              >
                {tr.props.children}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
export const TabsTrigger: React.FC<{value: string, children: React.ReactNode}> = ({value, children}) => {
  const ctx = useContext(TabsCtx)!
  const active = ctx.value===value
  return <button onClick={()=>ctx.setValue(value)} className={`px-3 py-1.5 text-sm rounded-lg ${active?'bg-slate-200 text-slate-800 shadow':'text-slate-300 hover:text-white'}`}>{children}</button>
}
export const TabsContent: React.FC<{value: string, className?: string, children: React.ReactNode}> = ({value, className='', children}) => {
  const ctx = useContext(TabsCtx)!
  return ctx.value===value ? <div className={className}>{children}</div> : null
}
