import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useDatabase } from '../hooks/useDatabase';
import { convertDataJsonToMovements, getPeriodReturnsFromJson, getRawJsonEntries } from '../lib/dataJson';
import { Fund } from '../types';

interface ImportAccountStatementsProps {
  currentFund: Fund;
  onImportComplete?: () => void;
}

export const ImportAccountStatements: React.FC<ImportAccountStatementsProps> = ({
  currentFund,
  onImportComplete
}) => {
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const { createMovements, getMovementsByFund, deleteMovement } = useDatabase();
  const [replaceExisting, setReplaceExisting] = useState(true);

  const [periodReturns, setPeriodReturns] = useState<Array<{
    period: string;
    startDate: string;
    endDate: string;
    periodReturn: number;
    annualReturn: number;
    initialQuoteValue: number;
    finalQuoteValue: number;
  }>>([]);
  const [rawEntries, setRawEntries] = useState<Array<any>>([]);

  useEffect(() => {
    (async () => {
      try {
        const [pr, raw] = await Promise.all([
          getPeriodReturnsFromJson('/dat.json'),
          getRawJsonEntries('/dat.json'),
        ]);
        setPeriodReturns(pr);
        setRawEntries(raw);
      } catch (e) {
        console.error('Error cargando data.json:', e);
      }
    })();
  }, []);

  const handleImport = async () => {
    if (!currentFund) return;

    setImporting(true);
    try {
      // Si se requiere, eliminar movimientos existentes del fondo
      if (replaceExisting) {
        const existing = getMovementsByFund(currentFund.id);
        for (const m of existing) {
          await deleteMovement(m.id);
        }
      }

      // Cargar y convertir data.json a movimientos
      const movements = await convertDataJsonToMovements(currentFund.id, '/dat.json');
      
      // Importar los movimientos a la base de datos
      await createMovements(movements);
      
      setImported(true);
      onImportComplete?.();
    } catch (error) {
      console.error('Error importing account statements:', error);
      alert('Error al importar los estados de cuenta');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="w-full bg-slate-900 border border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <span className="inline-flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            Importar Estados de Cuenta
          </span>
          {imported && <span className="inline-flex items-center rounded-full border border-slate-600 bg-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-200">Importado</span>}
        </CardTitle>
        <CardDescription className="text-slate-400">
          Importa los datos históricos de los estados de cuenta del fondo mutuo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6 overflow-auto max-h-[calc(100vh-200px)]">
        {/* Opción de sobrescritura */}
        <div className="flex items-center gap-2">
          <input 
            id="replace-existing" 
            type="checkbox" 
            checked={replaceExisting} 
            onChange={(e) => setReplaceExisting(e.target.checked)}
          />
          <label htmlFor="replace-existing" className="text-sm text-slate-300">
            Sobrescribir movimientos existentes del fondo al importar
          </label>
        </div>
        {/* Resumen de períodos disponibles */}
        <div className="space-y-2">
          <h4 className="font-medium text-slate-200">Períodos disponibles para importar:</h4>
          <div className="grid gap-2">
            {periodReturns.map((period, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 bg-slate-800 rounded-lg border border-slate-700">
                <div>
                  <div className="font-medium text-sm text-slate-200">{period.period}</div>
                  <div className="text-xs text-slate-400">
                    Valor cuota: ${period.initialQuoteValue.toFixed(2)} → ${period.finalQuoteValue.toFixed(2)}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-sm font-medium text-green-400">
                    +{period.periodReturn}%
                  </div>
                  <div className="text-xs text-slate-400">
                    Anual: {period.annualReturn}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen de movimientos */}
        <div className="space-y-2">
          <h4 className="font-medium text-slate-200">Movimientos a importar:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-2xl font-bold text-blue-400">
                {rawEntries.filter((e: any) => (e.concepto || '').toLowerCase().includes('aporte')).length}
              </div>
              <div className="text-sm text-blue-400">Aportes</div>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-2xl font-bold text-green-400">
                {rawEntries.filter((e: any) => (e.concepto || '').toLowerCase().includes('rendimiento')).length}
              </div>
              <div className="text-sm text-green-400">Rendimientos</div>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-2xl font-bold text-red-400">
                {rawEntries.filter((e: any) => (e.concepto || '').toLowerCase().includes('rescate')).length}
              </div>
              <div className="text-sm text-red-400">Rescates</div>
            </div>
          </div>
        </div>

        {/* Botón de importación */}
        <div className="pt-4">
          <Button 
            onClick={handleImport}
            disabled={importing || imported}
            className="w-full bg-slate-100 text-slate-800 rounded-xl px-4 py-2 hover:bg-slate-200 transition-colors"
          >
            {importing ? 'Importando...' : imported ? 'Datos Importados' : 'Importar Estados de Cuenta'}
          </Button>
          {imported && (
            <p className="text-sm text-green-600 mt-2 text-center">
              ✅ Los datos han sido importados exitosamente
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};