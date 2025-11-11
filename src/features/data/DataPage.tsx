import React, { useMemo, useState, useCallback } from "react";
import type { Movement, Fund } from "@/types";
import { CustomSelect } from "@/components/CustomSelect";
import { CustomInput } from "@/components/CustomInput";
import { Plus } from "lucide-react";
import { resolveFundIconSrc } from "@/fundPresets";
import { RowEditor } from "./RowEditor";
import { parseISO, deriveType } from "@/lib/movements";

const uuid = () =>
  typeof crypto !== "undefined" && (crypto as any).randomUUID
    ? (crypto as any).randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export default function DataPage({
  rows,
  currentFundId,
  funds,
  onAddRow,
  onUpdateRow,
  onDeleteRow,
}: {
  rows: Movement[];
  currentFundId: string;
  funds: Fund[];
  onAddRow: (m: Movement) => void;
  onUpdateRow: (m: Movement) => void;
  onDeleteRow: (id: string) => void;
}) {
  const [fundFilter, setFundFilter] = useState<string>(currentFundId || "all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const passesFund = fundFilter === "all" || r.fundId === fundFilter;
      const t = deriveType(r.concept);
      const passesType = typeFilter === "all" || t === typeFilter;
      const s = search.trim().toLowerCase();
      const passesSearch = !s || (r.concept || "").toLowerCase().includes(s);
      const d = parseISO(r.date);
      const passesFrom = !dateFrom || parseISO(dateFrom) <= d;
      const passesTo = !dateTo || d <= parseISO(dateTo);
      return passesFund && passesType && passesSearch && passesFrom && passesTo;
    });
  }, [rows, fundFilter, typeFilter, search, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const fundOptions = [
    { value: "all", label: "Todos" },
    ...funds.map((f) => ({
      value: f.id,
      label: f.name,
      iconSrc: resolveFundIconSrc(f),
    })),
  ];

  const typeOptions = [
    { value: "all", label: "Todos" },
    { value: "Aporte", label: "Aporte" },
    { value: "Rescate", label: "Rescate" },
    { value: "Rendimiento", label: "Rendimiento" },
    { value: "Saldo Anterior", label: "Saldo Anterior" },
    { value: "Saldo Final", label: "Saldo Final" },
    { value: "Otro", label: "Otro" },
  ];

  const addRow = useCallback(() => {
    const targetFundId = fundFilter === "all" ? currentFundId : fundFilter;
    const newRow: Movement = {
      id: uuid(),
      fundId: targetFundId,
      date: new Date().toISOString().slice(0, 10),
      concept: "",
      shares: 0,
      amount: 0,
      nav: 0,
      periodReturnPct: undefined,
      annualReturnPct: undefined,
    };
    onAddRow(newRow);
  }, [fundFilter, currentFundId, onAddRow]);

  const updateRow = useCallback((id: string, next: Movement) => onUpdateRow(next), [onUpdateRow]);
  const deleteRow = useCallback((id: string) => onDeleteRow(id), [onDeleteRow]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1">
            <CustomSelect label="Fondo" value={fundFilter} options={fundOptions} onValueChange={setFundFilter} />
          </div>
          <div className="space-y-1">
            <CustomSelect label="Tipo" value={typeFilter} options={typeOptions} onValueChange={setTypeFilter} />
          </div>
          <div className="space-y-1">
            <CustomInput label="Desde" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full min-w-[8rem]" placeholder="yyyy-mm-dd" />
          </div>
          <div className="space-y-1">
            <CustomInput label="Hasta" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full min-w-[8rem]" placeholder="yyyy-mm-dd" />
          </div>
          <div className="space-y-1">
            <CustomInput label="Buscar" placeholder="Concepto" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="custom-scrollbar max-h-96 overflow-y-auto rounded-lg border border-slate-700 bg-slate-900/50 p-4">
        <table className="w-full">
          <thead>
            <tr className="hidden md:table-row">
              <th className="p-2 text-left text-slate-300">Fecha</th>
              <th className="p-2 text-left text-slate-300">Concepto</th>
              <th className="p-2 text-left text-slate-300">Mov. en Cuotas</th>
              <th className="p-2 text-left text-slate-300">Mov. en $</th>
              <th className="p-2 text-left text-slate-300">Valor de Cuota</th>
              <th className="p-2 text-left text-slate-300">Rentab. período (%)</th>
              <th className="p-2 text-left text-slate-300">Rentab. anual (%)</th>
              <th className="p-2 text-left text-slate-300">Fondo</th>
              <th className="p-2 text-left text-slate-300"></th>
            </tr>
          </thead>
          <tbody className="block space-y-4 md:table-row-group md:space-y-0">
            {paginatedRows.length === 0 ? (
              <tr className="block md:table-row">
                <td colSpan={9} className="h-32 text-center text-slate-400">
                  <p className="text-lg font-medium">No hay datos</p>
                </td>
              </tr>
            ) : (
              paginatedRows.map((r) => (
                <RowEditor key={r.id} row={r} onChange={(nr) => updateRow(r.id, nr)} onDelete={() => deleteRow(r.id)} funds={funds} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="rounded-full bg-slate-700 px-4 py-2 font-medium text-slate-200 shadow-md transition-colors duration-200 hover:bg-slate-600 disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="rounded-full bg-slate-800 px-4 py-2 font-medium text-slate-300">
          {currentPage} / {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="rounded-full bg-slate-700 px-4 py-2 font-medium text-slate-200 shadow-md transition-colors duration-200 hover:bg-slate-600 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>

      <div className="flex justify-center pt-2 md:justify-start">
        <button onClick={addRow} className="flex items-center gap-2 rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-800 transition-colors duration-200 hover:bg-slate-300">
          <Plus className="h-4 w-4" />
          <span>Agregar reporte al fondo actual</span>
        </button>
      </div>
    </div>
  );
}