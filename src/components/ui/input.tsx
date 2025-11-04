import React from 'react'
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function I({className='', ...p}, ref){
  return <input ref={ref} className={`w-full rounded-xl border border-slate-600 bg-slate-700 text-white placeholder-slate-400 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${className}`} {...p}/>
})
