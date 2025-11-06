import React, { useState } from "react";
import type { Movement, Fund } from "@/types";
import { resolveFundIconSrc } from "@/fundPresets";
import { CustomInput } from "@/components/CustomInput";
import { CustomSelect } from "@/components/CustomSelect";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Trash2 } from "lucide-react";

export function RowEditor({
  row,
  onChange,
  onDelete,
  funds,
}: {
  row: Movement;
  onChange: (r: Movement) => void;
  onDelete: () => void;
  funds: Fund[];
}) {
  const fundOptions = funds.map((f) => ({
    value: f.id,
    label: f.name,
    iconSrc: resolveFundIconSrc(f),
  }));
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleDelete = () => {
    onDelete();
    setIsConfirmOpen(false);
  };

  return (
    <tr className="mb-4 block overflow-hidden rounded-lg border-b border-slate-700 bg-slate-800/20 md:mb-0 md:table-row md:rounded-none md:bg-transparent">
      <td className="flex items-center justify-between gap-2 p-2 md:table-cell">
        <span className="w-32 text-sm font-bold text-slate-400 md:hidden">Fecha</span>
        <CustomInput
          type="date"
          value={row.date}
          onChange={(e) => onChange({ ...row, date: e.target.value })}
          className="flex-1 min-w-[8rem]"
          placeholder="yyyy-mm-dd"
        />
      </td>
      <td className="flex items-center justify-between gap-2 p-2 md:table-cell">
        <span className="w-32 text-sm font-bold text-slate-400 md:hidden">Concepto</span>
        <CustomInput
          value={row.concept}
          onChange={(e) => onChange({ ...row, concept: e.target.value })}
          placeholder="Concepto"
          className="flex-1"
        />
      </td>
      <td className="flex items-center justify-between gap-2 p-2 md:table-cell">
        <span className="w-32 text-sm font-bold text-slate-400 md:hidden">Mov. en Cuotas</span>
        <CustomInput
          type="number"
          step="0.000001"
          value={row.shares}
          onChange={(e) => onChange({ ...row, shares: Number(e.target.value) })}
          className="flex-1"
        />
      </td>
      <td className="flex items-center justify-between gap-2 p-2 md:table-cell">
        <span className="w-32 text-sm font-bold text-slate-400 md:hidden">Mov. en $</span>
        <CustomInput
          type="number"
          step="0.01"
          value={row.amount}
          onChange={(e) => onChange({ ...row, amount: Number(e.target.value) })}
          className="flex-1"
          min="-999999999"
        />
      </td>
      <td className="flex items-center justify-between gap-2 p-2 md:table-cell">
        <span className="w-32 text-sm font-bold text-slate-400 md:hidden">Valor de Cuota</span>
        <CustomInput
          type="number"
          step="0.000001"
          value={row.nav}
          onChange={(e) => onChange({ ...row, nav: Number(e.target.value) })}
          className="flex-1"
        />
      </td>
      <td className="flex items-center justify-between gap-2 p-2 md:table-cell">
        <span className="w-32 text-sm font-bold text-slate-400 md:hidden">Rentab. período (%)</span>
        <CustomInput
          type="number"
          step="0.01"
          value={row.periodReturnPct ?? 0}
          onChange={(e) => onChange({ ...row, periodReturnPct: Number(e.target.value) })}
          className="flex-1"
        />
      </td>
      <td className="flex items-center justify-between gap-2 p-2 md:table-cell">
        <span className="w-32 text-sm font-bold text-slate-400 md:hidden">Rentab. anual (%)</span>
        <CustomInput
          type="number"
          step="0.01"
          value={row.annualReturnPct ?? 0}
          onChange={(e) => onChange({ ...row, annualReturnPct: Number(e.target.value) })}
          className="flex-1"
        />
      </td>
      <td className="flex items-center justify-between gap-2 p-2 md:table-cell">
        <span className="w-[5.4rem] text-sm font-bold text-slate-400 md:hidden">Fondo</span>
        <CustomSelect
          value={row.fundId}
          options={fundOptions}
          onValueChange={(v) => onChange({ ...row, fundId: v })}
          className="flex-1"
        />
      </td>
      <td className="flex justify-end p-2 md:table-cell">
        <ConfirmDialog
          open={isConfirmOpen}
          onOpenChange={setIsConfirmOpen}
          onConfirm={handleDelete}
          title="¿Estas seguro?"
          description="Esta acción no se puede deshacer. Esto se eliminará permanentemente el movimiento."
        >
          <button
            onClick={() => setIsConfirmOpen(true)}
            className="flex flex-shrink-0 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </ConfirmDialog>
      </td>
    </tr>
  );
}