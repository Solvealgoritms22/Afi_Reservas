import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Fund } from '../types';
import { FUND_PRESETS, getFundPresetKeyFromFund, presetByKey, resolveFundIconSrc } from '../fundPresets';

type Props = {
  fund: Fund | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FundInfoDialog({ fund, open, onOpenChange }: Props) {
  const presetKey = fund ? getFundPresetKeyFromFund(fund) : undefined;
  const preset = presetKey ? presetByKey(presetKey) : undefined;

  const cover = preset?.cover || (fund ? resolveFundIconSrc(fund) : undefined) || '/favicon.svg';
  const name = fund?.name || preset?.name || 'Fondo';

  return (
    
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-slate-900 border border-slate-700 w-[90%] h-[85%] max-w-3xl p-6 sm:p-8 md:p-10 rounded-xl">
        <AlertDialogHeader className="mb-4">
          <AlertDialogTitle className="text-white text-lg sm:text-xl">{name}</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300"></AlertDialogDescription>
        </AlertDialogHeader>

        {/* Scrollable inner area so the dialog never exceeds viewport height */}
        <div className="max-h-[60vh] sm:max-h-[70vh] overflow-y-auto px-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="md:col-span-1 flex items-start justify-center mb-4 md:mb-0">
              <img src={cover} alt={name} className="w-32 h-32 sm:w-40 sm:h-40 object-contain" />
            </div>
            <div className="md:col-span-2 space-y-3 sm:space-y-2">
              {preset?.description && (
                <p className="text-slate-300 leading-relaxed text-sm sm:text-base">{preset.description}</p>
              )}
              {preset?.uses && preset.uses.length > 0 && (
                <div>
                  <div className="text-slate-200 font-semibold mb-2 text-sm sm:text-base">Posibles usos del Fondo:</div>
                  <ul className="list-disc pl-5 space-y-1 sm:space-y-2 text-slate-300 text-sm sm:text-base">
                    {preset.uses.map((u, idx) => (
                      <li key={idx}>{u}</li>
                    ))}
                  </ul>
                </div>
              )}
              {preset?.docs && preset.docs.length > 0 && (
                <div className="mt-3 sm:mt-4">
                  <div className="text-slate-200 font-semibold mb-2 text-sm sm:text-base">Documentos:</div>
                  <div className="rounded-lg overflow-hidden border border-slate-700 divide-y divide-slate-700 bg-slate-800/40">
                    {preset.docs.map((d, idx) => (
                      <a key={idx} href={d.url} target="_blank" rel="noopener noreferrer" className="block px-3 py-2 sm:px-4 sm:py-3 text-slate-200 hover:bg-slate-800 text-sm sm:text-base">
                        {d.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <AlertDialogFooter className="mt-6 flex-col sm:flex-row gap-2 sm:gap-0">
          <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700 w-full sm:w-auto px-4 py-2 text-sm sm:text-base">Cerrar</AlertDialogCancel>
          <AlertDialogAction className="bg-slate-200 text-slate-900 hover:bg-white w-full sm:w-auto px-4 py-2 text-sm sm:text-base">Entendido</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
