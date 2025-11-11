import { db, auth } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import type { Fund, Movement } from "../types";
import { getFundPresetKeyFromFund, normalizeName } from "../fundPresets";

class FirestoreDatabase {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    // Validar sesión activa
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Usuario no autenticado");
    }
    this.initialized = true;
    // Migrar desde sql.js a Firestore si colecciones vacías (no bloquear inicialización)
    // Se ejecuta de forma desacoplada para evitar que la app quede en loading en cuentas nuevas
    this.migrateFromSqlJsIfEmpty().catch((err) => {
      console.warn("No se pudo migrar desde SQL.js (continuando sin bloqueo):", err);
    });
  }

  private userFundsCol() {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");
    return collection(db, "users", user.uid, "funds");
  }

  private userMovementsCol() {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");
    return collection(db, "users", user.uid, "movements");
  }

  // CRUD Funds
  async createFund(fund: Fund): Promise<void> {
    await this.ensureInit();
    // Enforce uniqueness por tipo/preset o nombre normalizado
    const existing = await this.getAllFunds();
    const newKey = getFundPresetKeyFromFund(fund);
    const existsSameType = existing.some((f) => {
      const k = getFundPresetKeyFromFund(f);
      if (newKey && k) return k === newKey;
      return normalizeName(f.name) === normalizeName(fund.name);
    });
    if (existsSameType) {
      throw new Error("Ya tienes un fondo de este tipo. Solo se permite uno por tipo.");
    }
    const ref = doc(this.userFundsCol(), fund.id);
    await setDoc(ref, omitUndefined(fund));
  }

  async getAllFunds(): Promise<Fund[]> {
    await this.ensureInit();
    const snap = await getDocs(this.userFundsCol());
    return snap.docs.map((d) => d.data() as Fund);
  }

  async updateFund(fund: Fund): Promise<void> {
    await this.ensureInit();
    const ref = doc(this.userFundsCol(), fund.id);
    await setDoc(ref, omitUndefined(fund), { merge: true });
  }

  async deleteFund(id: string): Promise<void> {
    await this.ensureInit();
    const ref = doc(this.userFundsCol(), id);
    await deleteDoc(ref);
    // Eliminar movimientos del fondo
    const q = query(this.userMovementsCol(), where("fundId", "==", id));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  // CRUD Movements
  async createMovement(movement: Movement): Promise<void> {
    await this.ensureInit();
    const ref = doc(this.userMovementsCol(), movement.id);
    await setDoc(ref, omitUndefined(movement));
  }

  async createMovements(movements: Movement[]): Promise<void> {
    await this.ensureInit();
    const batch = writeBatch(db);
    movements.forEach((m) => {
      const ref = doc(this.userMovementsCol(), m.id);
      batch.set(ref, omitUndefined(m));
    });
    await batch.commit();
  }

  async getAllMovements(): Promise<Movement[]> {
    await this.ensureInit();
    const q = query(this.userMovementsCol(), orderBy("date", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Movement);
  }

  async getMovementsByFund(fundId: string): Promise<Movement[]> {
    await this.ensureInit();
    const q = query(
      this.userMovementsCol(),
      where("fundId", "==", fundId),
      orderBy("date", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Movement);
  }

  async updateMovement(movement: Movement): Promise<void> {
    await this.ensureInit();
    const ref = doc(this.userMovementsCol(), movement.id);
    await updateDoc(ref, omitUndefined(movement) as any);
  }

  async deleteMovement(id: string): Promise<void> {
    await this.ensureInit();
    const ref = doc(this.userMovementsCol(), id);
    await deleteDoc(ref);
  }

  private async ensureInit() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  // Migración inicial desde SQL.js si Firestore está vacío
  private async migrateFromSqlJsIfEmpty(): Promise<void> {
    // Si no hay ninguna base local presente, omitir migración por completo
    const hasLocalSqlData =
      typeof localStorage !== "undefined" &&
      (
        localStorage.getItem("sqlite-db") ||
        localStorage.getItem("fund-db-v6") ||
        localStorage.getItem("fund-db-v3") ||
        localStorage.getItem("fund-db-v2") ||
        localStorage.getItem("fund-db-v1")
      );
    if (!hasLocalSqlData) {
      console.log("Sin base local detectada, omitiendo migración a Firestore");
      return;
    }

    try {
      const fundsSnap = await getDocs(this.userFundsCol());
      const movementsSnap = await getDocs(this.userMovementsCol());
      if (!fundsSnap.empty || !movementsSnap.empty) return;
    } catch (err) {
      // Si hay error al leer (reglas, red, etc.), no bloquear la app
      console.warn("Lectura inicial de Firestore falló, omitiendo migración:", err);
      return;
    }

    try {
      // Import dinámico de la base de datos local existente
      const { getDatabase } = await import("./database");
      const sqlDb = await getDatabase();
      const localFunds = sqlDb.getAllFunds();
      const localMovements = sqlDb.getAllMovements();
      if (localFunds.length === 0 && localMovements.length === 0) return;

      const batch = writeBatch(db);
      localFunds.forEach((f) => {
        const ref = doc(this.userFundsCol(), f.id);
        batch.set(ref, omitUndefined(f));
      });
      localMovements.forEach((m) => {
        const ref = doc(this.userMovementsCol(), m.id);
        batch.set(ref, omitUndefined(m));
      });
      await batch.commit();
      // Opcional: limpiar localStorage del SQL.js para evitar confusión
      try {
        localStorage.removeItem("sqlite-db");
      } catch {}
      console.log("Migración a Firestore completada");
    } catch (err) {
      console.warn("No se pudo migrar desde SQL.js:", err);
    }
  }
}

// Helper: remove undefined fields (Firestore does not accept undefined)
function omitUndefined<T extends Record<string, any>>(obj: T): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}

// Singleton
let instance: FirestoreDatabase | null = null;
export const getDatabase = async (): Promise<FirestoreDatabase> => {
  if (!instance) instance = new FirestoreDatabase();
  await instance.initialize();
  return instance;
};

export default FirestoreDatabase;