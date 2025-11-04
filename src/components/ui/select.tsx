import React from 'react'
type SelectProps = {value?: string, onValueChange: (v:string)=>void, children: React.ReactNode}
type Item = {value: string, label: React.ReactNode}
function collect(children: any, out: Item[]){
  React.Children.forEach(children, (ch: any)=>{
    if (!ch) return
    if (ch.type && ch.type.displayName==='SelectItem'){ out.push({value: ch.props.value, label: ch.props.children}) }
    else if (ch.props && ch.props.children) collect(ch.props.children, out)
  })
}
export const Select: React.FC<SelectProps> = ({value, onValueChange, children}) => {
  const items: Item[] = []; collect(children, items)
  return <select className='w-64 rounded-xl border border-slate-600 bg-slate-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500' value={value} onChange={e=>onValueChange(e.target.value)}>
    {items.map(it => <option key={it.value} value={it.value} className="bg-slate-700 text-white">{it.label}</option>)}
  </select>
}
export const SelectTrigger: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({children}) => <>{children}</>
export const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({children}) => <>{children}</>
export const SelectItem: React.FC<{value: string, children: React.ReactNode}> = () => null
SelectItem.displayName = 'SelectItem'
export const SelectValue: React.FC<{placeholder?: string}> = ({placeholder}) => <span>{placeholder}</span>
