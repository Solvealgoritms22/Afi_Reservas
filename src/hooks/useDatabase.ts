import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Fund, Movement } from '../types';
import { getDatabase } from '../lib/firestoreDatabase';
import { getFundPresetKeyFromFund, normalizeName } from '../fundPresets';
import { auth } from '../lib/firebase';

export const useDatabase = () => {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const db = await getDatabase();
      const [loadedFunds, loadedMovements] = await Promise.all([
        db.getAllFunds(),
        db.getAllMovements(),
      ]);
      setFunds(loadedFunds);
      setMovements(loadedMovements);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err instanceof Error ? err.message : "Error loading data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        reload();
      } else {
        // Evitar lecturas de Firestore sin autenticación
        setLoading(false);
        setFunds([]);
        setMovements([]);
      }
    });
    return () => unsub();
  }, [reload]);

  const withErrorHandling = useCallback(
    async <T,>(op: () => Promise<T> | T, successMessage?: string): Promise<T | undefined> => {
      try {
        setError(null);
        const result = await op();
        if (successMessage) {
          // Optionally, you could set a success message state here
        }
        return result;
      } catch (err) {
        console.error("Database operation failed:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
        return undefined;
      }
    },
    []
  );

  // Operaciones de fondos
  const createFund = useCallback(
    (fund: Fund) =>
      withErrorHandling(async () => {
        const db = await getDatabase();

        // Enforce unique fund type (preset). If preset not present, fallback to normalized name uniqueness among presets
        const newKey = getFundPresetKeyFromFund(fund);
        const existingFunds = await db.getAllFunds();
        const existsSameType = existingFunds.some((f) => {
          const k = getFundPresetKeyFromFund(f);
          if (newKey && k) return k === newKey;
          // fallback: if both are preset-less but names match a preset name, enforce by name
          return normalizeName(f.name) === normalizeName(fund.name);
        });
        if (existsSameType) {
          throw new Error('Ya tienes un fondo de este tipo. Solo se permite uno por tipo.');
        }

        await db.createFund(fund);
        setFunds((prev) => [...prev, fund]);
      }),
    [withErrorHandling]
  );

  const updateFund = useCallback(
    (fund: Fund) =>
      withErrorHandling(async () => {
        const db = await getDatabase();
        await db.updateFund(fund);
        setFunds((prev) => prev.map((f) => (f.id === fund.id ? fund : f)));
      }),
    [withErrorHandling]
  );

  const deleteFund = useCallback(
    (id: string) =>
      withErrorHandling(async () => {
        const db = await getDatabase();
        await db.deleteFund(id);
        setFunds((prev) => prev.filter((f) => f.id !== id));
        setMovements((prev) => prev.filter((m) => m.fundId !== id));
      }),
    [withErrorHandling]
  );

  // Operaciones de movimientos
  const createMovement = useCallback(
    (movement: Movement) =>
      withErrorHandling(async () => {
        const db = await getDatabase();
        await db.createMovement(movement);
        setMovements((prev) => [movement, ...prev]);
      }),
    [withErrorHandling]
  );

  const updateMovement = useCallback(
    (movement: Movement) =>
      withErrorHandling(async () => {
        const db = await getDatabase();
        await db.updateMovement(movement);
        setMovements((prev) =>
          prev.map((m) => (m.id === movement.id ? movement : m))
        );
      }),
    [withErrorHandling]
  );

  const deleteMovement = useCallback(
    (id: string) =>
      withErrorHandling(async () => {
        const db = await getDatabase();
        await db.deleteMovement(id);
        setMovements((prev) => prev.filter((m) => m.id !== id));
      }),
    [withErrorHandling]
  );

  const createMovements = useCallback(
    (movements: Movement[]) =>
      withErrorHandling(async () => {
        const db = await getDatabase();
        await db.createMovements(movements);
        const allMovements = await db.getAllMovements();
        setMovements(allMovements);
      }),
    [withErrorHandling]
  );

  // Función para obtener movimientos por fondo
  const getMovementsByFund = useCallback((fundId: string) => {
    return movements.filter(m => m.fundId === fundId);
  }, [movements]);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    funds,
    movements,
    loading,
    error,

    // Operaciones de fondos
    createFund,
    updateFund,
    deleteFund,

    // Operaciones de movimientos
    createMovement,
    updateMovement,
    deleteMovement,
    createMovements,

    // Utilidades
    getMovementsByFund,
    clearError,
    reload,
  };
};
