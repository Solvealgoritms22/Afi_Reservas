import React from 'react'
export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({className='', ...p}) => <label className={`text-xs uppercase tracking-wide text-slate-300 ${className}`} {...p}/>
