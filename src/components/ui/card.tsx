import React from 'react'

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({className='', ...p}) => <div className={`bg-slate-800 border border-slate-700 rounded-2xl ${className}`} {...p}/>

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({className='', ...p}) => <div className={className} {...p}/>

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({className='', ...p}) => <div className={`p-6 pb-0 ${className}`} {...p}/>

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({className='', ...p}) => <h3 className={`text-lg font-semibold text-white ${className}`} {...p}/>

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({className='', ...p}) => <p className={`text-sm text-slate-400 ${className}`} {...p}/>
