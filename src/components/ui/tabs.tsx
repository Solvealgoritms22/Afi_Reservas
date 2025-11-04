import React, {createContext, useContext, useState} from 'react'
type Ctx = {value: string, setValue: (v:string)=>void}
const TabsCtx = createContext<Ctx | null>(null)
export const Tabs: React.FC<{defaultValue: string, className?: string, children: React.ReactNode}> = ({defaultValue, className='', children}) => {
  const [value, setValue] = useState(defaultValue)
  return <div className={className}><TabsCtx.Provider value={{value, setValue}}>{children}</TabsCtx.Provider></div>
}
export const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({className='', ...p}) => <div className={`inline-flex rounded-xl bg-slate-700 p-1 ${className}`} {...p}/>
export const TabsTrigger: React.FC<{value: string, children: React.ReactNode}> = ({value, children}) => {
  const ctx = useContext(TabsCtx)!
  const active = ctx.value===value
  return <button onClick={()=>ctx.setValue(value)} className={`px-3 py-1.5 text-sm rounded-lg ${active?'bg-slate-200 text-slate-800 shadow':'text-slate-300 hover:text-white'}`}>{children}</button>
}
export const TabsContent: React.FC<{value: string, className?: string, children: React.ReactNode}> = ({value, className='', children}) => {
  const ctx = useContext(TabsCtx)!
  return ctx.value===value ? <div className={className}>{children}</div> : null
}
