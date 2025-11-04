import initSqlJs, { Database } from 'sql.js';
import { Fund, Movement } from '../types';
import { getFundPresetKeyFromFund, normalizeName } from '../fundPresets';

class DatabaseManager {
  private db: Database | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Inicializar sql.js
      const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`
      });

      // Intentar cargar base de datos existente desde localStorage
      const savedDb = localStorage.getItem('sqlite-db');
      if (savedDb) {
        const uint8Array = new Uint8Array(JSON.parse(savedDb));
        this.db = new SQL.Database(uint8Array);
      } else {
        // Crear nueva base de datos
        this.db = new SQL.Database();
      }

      // Crear tablas si no existen
      this.createTables();
      this.initialized = true;

      // Migrar datos si es necesario
      this.migrateFromLocalStorage();
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private createTables(): void {
    if (!this.db) throw new Error('Database not initialized');

    // Crear tabla de fondos
    this.db.run(`
      CREATE TABLE IF NOT EXISTS funds (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        adminFeePct REAL NOT NULL,
        logoDataUrl TEXT
      )
    `);

    // Crear tabla de movimientos
    this.db.run(`
      CREATE TABLE IF NOT EXISTS movements (
        id TEXT PRIMARY KEY,
        fundId TEXT NOT NULL,
        date TEXT NOT NULL,
        concept TEXT NOT NULL,
        shares REAL NOT NULL,
        amount REAL NOT NULL,
        nav REAL NOT NULL,
        periodReturnPct REAL,
        annualReturnPct REAL,
        FOREIGN KEY (fundId) REFERENCES funds (id)
      )
    `);
  }

  private saveToLocalStorage(): void {
    if (!this.db) return;
    
    try {
      const data = this.db.export();
      const dataArray = Array.from(data);
      localStorage.setItem('sqlite-db', JSON.stringify(dataArray));
    } catch (error) {
      console.error('Error saving database to localStorage:', error);
    }
  }

  // CRUD operations for Funds
  createFund(fund: Fund): void {
    if (!this.db) throw new Error('Database not initialized');

    // Enforce unique fund type (preset). If no preset metadata, fallback to normalized name uniqueness
    const existing = this.getAllFunds();
    const newKey = getFundPresetKeyFromFund(fund as any);
    const existsSameType = existing.some((f) => {
      const k = getFundPresetKeyFromFund(f as any);
      if (newKey && k) return k === newKey;
      return normalizeName(f.name) === normalizeName(fund.name);
    });
    if (existsSameType) {
      throw new Error('Duplicate fund type not allowed');
    }

    const stmt = this.db.prepare(`
      INSERT INTO funds (id, name, adminFeePct, logoDataUrl)
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run([fund.id, fund.name, fund.adminFeePct, fund.logoDataUrl || null]);
    this.saveToLocalStorage();
  }

  getAllFunds(): Fund[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM funds');
    const results = stmt.getAsObject({});
    const funds: Fund[] = [];

    while (stmt.step()) {
      const row = stmt.getAsObject();
      funds.push({
        id: row.id as string,
        name: row.name as string,
        adminFeePct: row.adminFeePct as number,
        logoDataUrl: row.logoDataUrl as string || undefined
      });
    }

    return funds;
  }

  updateFund(fund: Fund): void {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      UPDATE funds 
      SET name = ?, adminFeePct = ?, logoDataUrl = ?
      WHERE id = ?
    `);
    
    stmt.run([fund.name, fund.adminFeePct, fund.logoDataUrl || null, fund.id]);
    this.saveToLocalStorage();
  }

  deleteFund(id: string): void {
    if (!this.db) throw new Error('Database not initialized');

    // Primero eliminar movimientos relacionados
    this.db.run('DELETE FROM movements WHERE fundId = ?', [id]);
    
    // Luego eliminar el fondo
    this.db.run('DELETE FROM funds WHERE id = ?', [id]);
    this.saveToLocalStorage();
  }

  // CRUD operations for Movements
  createMovement(movement: Movement): void {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT INTO movements (id, fundId, date, concept, shares, amount, nav, periodReturnPct, annualReturnPct)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([
      movement.id,
      movement.fundId,
      movement.date,
      movement.concept,
      movement.shares,
      movement.amount,
      movement.nav,
      movement.periodReturnPct || null,
      movement.annualReturnPct || null
    ]);
    this.saveToLocalStorage();
  }

  createMovements(movements: Movement[]): void {
    if (!this.db) throw new Error('Database not initialized');

    for (const movement of movements) {
      try {
        this.createMovement(movement);
      } catch (error) {
        // Ignorar errores de duplicados
        console.warn('Movement already exists:', movement.id);
      }
    }
  }

  getAllMovements(): Movement[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM movements ORDER BY date DESC');
    const movements: Movement[] = [];

    while (stmt.step()) {
      const row = stmt.getAsObject();
      movements.push({
        id: row.id as string,
        fundId: row.fundId as string,
        date: row.date as string,
        concept: row.concept as string,
        shares: row.shares as number,
        amount: row.amount as number,
        nav: row.nav as number,
        periodReturnPct: row.periodReturnPct as number || undefined,
        annualReturnPct: row.annualReturnPct as number || undefined
      });
    }

    return movements;
  }

  getMovementsByFund(fundId: string): Movement[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM movements WHERE fundId = ? ORDER BY date DESC');
    stmt.bind([fundId]);
    const movements: Movement[] = [];

    while (stmt.step()) {
      const row = stmt.getAsObject();
      movements.push({
        id: row.id as string,
        fundId: row.fundId as string,
        date: row.date as string,
        concept: row.concept as string,
        shares: row.shares as number,
        amount: row.amount as number,
        nav: row.nav as number,
        periodReturnPct: row.periodReturnPct as number || undefined,
        annualReturnPct: row.annualReturnPct as number || undefined
      });
    }

    return movements;
  }

  updateMovement(movement: Movement): void {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      UPDATE movements 
      SET fundId = ?, date = ?, concept = ?, shares = ?, amount = ?, nav = ?, periodReturnPct = ?, annualReturnPct = ?
      WHERE id = ?
    `);
    
    stmt.run([
      movement.fundId,
      movement.date,
      movement.concept,
      movement.shares,
      movement.amount,
      movement.nav,
      movement.periodReturnPct || null,
      movement.annualReturnPct || null,
      movement.id
    ]);
    this.saveToLocalStorage();
  }

  deleteMovement(id: string): void {
    if (!this.db) throw new Error('Database not initialized');

    this.db.run('DELETE FROM movements WHERE id = ?', [id]);
    this.saveToLocalStorage();
  }

  // Migrar datos desde localStorage (para transición)
  migrateFromLocalStorage(): void {
    const localData = localStorage.getItem('fund-db-v6') || 
                     localStorage.getItem('fund-db-v3') || 
                     localStorage.getItem('fund-db-v2') || 
                     localStorage.getItem('fund-db-v1');
    
    if (localData) {
      try {
        const data = JSON.parse(localData);
        
        // Migrar fondos
        if (data.funds && Array.isArray(data.funds)) {
          for (const fund of data.funds) {
            try {
              this.createFund(fund);
            } catch (error) {
              // Ignorar errores de duplicados
              console.warn('Fund already exists:', fund.id);
            }
          }
        }
        
        // Migrar movimientos
        if (data.movements && Array.isArray(data.movements)) {
          try {
            this.createMovements(data.movements);
          } catch (error) {
            console.warn('Some movements already exist, skipping duplicates');
          }
        }
        
        console.log('Migration from localStorage completed successfully');
        return;
      } catch (error) {
        console.error('Error migrating from localStorage:', error);
      }
    }
    
    // Si no hay datos en localStorage, crear datos de ejemplo
    this.createSampleData();
  }

  // Crear datos de ejemplo
  private createSampleData(): void {
    const uuid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
    
    // Verificar si ya existen datos
    const existingFunds = this.getAllFunds();
    if (existingFunds.length > 0) {
      return; // Ya hay datos, no crear ejemplos
    }
    
    const defaultFund = { id: uuid(), name: "Fondo Quisqueya", adminFeePct: 2, logoDataUrl: 'icon:/iconos/fondo_quisqueya.svg|preset:quisqueya' };
    
    const seedMovements = [
      { id: uuid(), fundId: defaultFund.id, date: "2025-01-31", concept: "Saldo anterior", shares: 510.401828, amount: 882525.17, nav: 1729.079168, periodReturnPct: 9.43, annualReturnPct: 10.80 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-02-28", concept: "Rendimiento Bruto", shares: 0, amount: 6121.94, nav: 1741.073505, periodReturnPct: 9.43, annualReturnPct: 10.80 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-02-28", concept: "Saldo Final", shares: 510.401828, amount: 888647.11, nav: 1741.073505, periodReturnPct: 9.43, annualReturnPct: 10.80 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-02-28", concept: "Saldo anterior", shares: 510.401828, amount: 888647.11, nav: 1741.073505, periodReturnPct: 8.26, annualReturnPct: 10.76 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-03-31", concept: "Rendimiento Bruto", shares: 0, amount: 6010.47, nav: 1752.849524, periodReturnPct: 8.26, annualReturnPct: 10.76 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-03-31", concept: "Saldo Final", shares: 510.401828, amount: 894657.58, nav: 1752.849524, periodReturnPct: 8.26, annualReturnPct: 10.76 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-03-31", concept: "Saldo anterior", shares: 510.401828, amount: 894657.58, nav: 1752.849524, periodReturnPct: 11.54, annualReturnPct: 10.97 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-04-30", concept: "Rendimiento Bruto", shares: 0, amount: 8069.41, nav: 1768.659430, periodReturnPct: 11.54, annualReturnPct: 10.97 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-04-30", concept: "Saldo Final", shares: 510.401828, amount: 902726.99, nav: 1768.659430, periodReturnPct: 11.54, annualReturnPct: 10.97 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-04-30", concept: "Saldo anterior", shares: 510.401828, amount: 902726.99, nav: 1768.659430, periodReturnPct: 7.76, annualReturnPct: 10.75 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-05-31", concept: "Rendimiento Bruto", shares: 0, amount: 5748.19, nav: 1779.921507, periodReturnPct: 7.76, annualReturnPct: 10.75 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-05-31", concept: "Saldo Final", shares: 510.401828, amount: 908475.18, nav: 1779.921507, periodReturnPct: 7.76, annualReturnPct: 10.75 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-05-31", concept: "Saldo anterior", shares: 510.401828, amount: 908475.18, nav: 1779.921507, periodReturnPct: 11.6, annualReturnPct: 10.82 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-06-06", concept: "Aportes inversionistas", shares: 50.475478, amount: 90000.0, nav: 1783.044006, periodReturnPct: 11.6, annualReturnPct: 10.82 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-06-30", concept: "Rendimiento Bruto", shares: 0, amount: 8889.45, nav: 1796.051677, periodReturnPct: 11.6, annualReturnPct: 10.82 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-06-30", concept: "Saldo Final", shares: 560.877307, amount: 1007364.63, nav: 1796.051677, periodReturnPct: 11.6, annualReturnPct: 10.82 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-06-30", concept: "Saldo anterior", shares: 560.877307, amount: 1007364.63, nav: 1796.051677, periodReturnPct: 11.89, annualReturnPct: 10.78 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-07-31", concept: "Rendimiento Bruto", shares: 0, amount: 9654.24, nav: 1813.264383, periodReturnPct: 11.89, annualReturnPct: 10.78 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-07-31", concept: "Saldo Final", shares: 560.877307, amount: 1017018.87, nav: 1813.264383, periodReturnPct: 11.89, annualReturnPct: 10.78 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-07-31", concept: "Saldo anterior", shares: 560.877307, amount: 1017018.87, nav: 1813.264383, periodReturnPct: 9.99, annualReturnPct: 10.71 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-08-31", concept: "Rendimiento Bruto", shares: 0, amount: 8258.79, nav: 1827.989104, periodReturnPct: 9.99, annualReturnPct: 10.71 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-08-31", concept: "Saldo Final", shares: 560.877307, amount: 1025277.66, nav: 1827.989104, periodReturnPct: 9.99, annualReturnPct: 10.71 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-08-31", concept: "Saldo anterior", shares: 560.877307, amount: 1025277.66, nav: 1827.989104, periodReturnPct: 8.41, annualReturnPct: 10.53 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-09-30", concept: "Rendimiento Bruto", shares: 0, amount: 6829.75, nav: 1840.166013, periodReturnPct: 8.41, annualReturnPct: 10.53 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-09-30", concept: "Saldo Final", shares: 560.877307, amount: 1032107.41, nav: 1840.166013, periodReturnPct: 8.41, annualReturnPct: 10.53 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-09-30", concept: "Saldo anterior", shares: 560.877307, amount: 1032107.41, nav: 1840.166013, periodReturnPct: 7.77, annualReturnPct: 10.16 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-10-06", concept: "Aportes inversionistas", shares: 54.279102, amount: 100000.0, nav: 1842.329668, periodReturnPct: 7.77, annualReturnPct: 10.16 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-10-31", concept: "Rendimiento Bruto", shares: 0, amount: 7103.93, nav: 1851.905082, periodReturnPct: 7.77, annualReturnPct: 10.16 },
      { id: uuid(), fundId: defaultFund.id, date: "2025-10-31", concept: "Saldo Final", shares: 615.156409, amount: 1139211.34, nav: 1851.905082, periodReturnPct: 7.77, annualReturnPct: 10.16 },
    ];
    
    try {
      this.createFund(defaultFund);
      this.createMovements(seedMovements);
      console.log('Sample data created successfully');
    } catch (error) {
      console.error('Error creating sample data:', error);
    }
  }
}

// Singleton instance
let dbInstance: DatabaseManager | null = null;

export const getDatabase = async (): Promise<DatabaseManager> => {
  if (!dbInstance) {
    dbInstance = new DatabaseManager();
    await dbInstance.initialize();
  }
  return dbInstance;
};

export default DatabaseManager;
