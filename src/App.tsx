import React, { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Trash2,
  LineChart,
  Check,
  Info,
  User,
  LogOut,
  ChevronDown,
  X,
  Table,
  Upload,
  Layers,
} from "lucide-react";
 
import type { Fund, Movement } from "./types";
import { useDatabase } from "./hooks/useDatabase";
import { ImportAccountStatements } from "./components/ImportAccountStatements";
import { toast } from "sonner";
import { CustomSelect } from "./components/CustomSelect";
import { ConfirmDialog } from "./components/ConfirmDialog";

import {
  FUND_PRESETS,
  getFundPresetKeyFromFund,
  resolveFundIconSrc,
} from "./fundPresets";
import { FundIcon } from "./components/FundIcon";
import { FundInfoDialog } from "./components/FundInfoDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";
import DashboardView from "@/features/dashboard/Dashboard";
import DataPageView from "@/features/data/DataPage";
import { formatDurationSince as formatDurationSinceUtil } from "@/lib/movements";
import { Footer } from "./components/Footer";
import { enableGlobalButtonHaptics } from "@/lib/haptics";

const uuid = () =>
  typeof crypto !== "undefined" && (crypto as any).randomUUID
    ? (crypto as any).randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);



export default function App() {
  const {
    funds,
    movements,
    loading,
    error,
    createFund,
    deleteFund,
    createMovement,
    updateMovement,
    deleteMovement,
    clearError,
    reload,
  } = useDatabase();

  const [currentFundId, setCurrentFundId] = useState<string>("");
  const [showAddFundDialog, setShowAddFundDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Fund | null>(null);
  const [infoTarget, setInfoTarget] = useState<Fund | null>(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const userName = useMemo(
    () => localStorage.getItem("userName") || "Fajardo",
    [],
  );
  const userAvatarUrl = useMemo(() => {
    const custom = localStorage.getItem("userAvatarUrl");
    if (custom && custom.trim()) return custom;
    // Fallback avatar local
    return "/avatars/fajardo.jpeg";
  }, [userName]);
  // Splash mínimo para que el loading permanezca visible unos segundos
  const [splashDone, setSplashDone] = useState(false);
  const [hasAnimatedOnce, setHasAnimatedOnce] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("kpiAnimatedOnce") === "1";
    } catch {
      return false;
    }
  });
  const [startKpiAnimation, setStartKpiAnimation] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 2200); // ~2.2s
    return () => clearTimeout(t);
  }, []);

  // Haptics global para botones en dispositivos móviles (Android principalmente)
  useEffect(() => {
    const cleanup = enableGlobalButtonHaptics();
    return cleanup;
  }, []);

  // Iniciar animación de KPIs justo después de finalizar el loading y el splash
  useEffect(() => {
    if (!loading && splashDone && !hasAnimatedOnce) {
      const t = setTimeout(() => setStartKpiAnimation(true), 200);
      return () => clearTimeout(t);
    }
  }, [loading, splashDone, hasAnimatedOnce]);

  // Establecer el fondo actual cuando se cargan los datos
  useEffect(() => {
    if (funds.length > 0 && !currentFundId) {
      setCurrentFundId(funds[0].id);
    }
  }, [funds, currentFundId]);

  const currentFund = funds.find((f) => f.id === currentFundId) || funds[0];
  const rowsOfFund = movements.filter((m) => m.fundId === currentFund?.id);

  // Duracion del fondo (desde el primer movimiento registrado hasta hoy)
  const fundStartISO = rowsOfFund.length
    ? rowsOfFund.reduce(
        (min, m) => (m.date < min ? m.date : min),
        rowsOfFund[0].date,
      )
    : undefined;
  const fundDurationText = fundStartISO
    ? formatDurationSinceUtil(fundStartISO)
    : "Sin datos";

  // Persistimos directamente en base de datos vÃ­a useDatabase

  // Abrir selector de presets para crear fondo
  const addFund = () => {
    setShowAddFundDialog(true);
  };

  // Utilidad para obtener la key de preset (reutiliza util compartido)
  const getPresetKeyFromFund = (f: Fund): string | undefined =>
    getFundPresetKeyFromFund(f);

  const createFundFromPreset = async (key: string) => {
    const preset = FUND_PRESETS.find((p) => p.key === key);
    if (!preset) return;
    const nf: Fund = {
      id: uuid(),
      name: preset.name,
      adminFeePct: preset.adminFeePct,
      logoDataUrl: `icon:${preset.icon}|preset:${preset.key}`,
    };
    await createFund(nf);
    setCurrentFundId(nf.id);
    setShowAddFundDialog(false);
  };

  const handleDeleteFund = async (fund: Fund) => {
    if (!fund) return;
    if (funds.length === 1) {
      alert("Debe existir al menos un fondo");
      setDeleteTarget(null);
      return;
    }
    const remaining = funds.filter((f) => f.id !== fund.id);
    await deleteFund(fund.id);
    if (currentFundId === fund.id) {
      setCurrentFundId(remaining[0]?.id || "");
    }
    setDeleteTarget(null);
  };

  const handleLogout = () => {
    // Simulacion de logout: no borra datos ni recarga
    setLogoutConfirmOpen(false);
    try {
      // Marca opcional para UI
      localStorage.setItem("lastLogoutAt", new Date().toISOString());
    } catch {}
    toast.success("Sesion cerrada (simulacion)");
  };

  // Eliminadas funciones de actualizacion/eliminacion del fondo (la seccion de configuracion fue removida)

  if (loading || !splashDone) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        <div className="flex flex-col items-center gap-6">
          <img
            src="/afi-reservas.png"
            alt="AFI Reservas"
            className="h-16 w-auto animate-pulse object-contain md:h-20"
          />
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3677afff] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        <div className="text-xl text-red-400">Error: {error}</div>
        <button
          onClick={clearError}
          className="ml-4 rounded bg-red-600 px-4 py-2 text-white"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Header fijo siempre visible */}
      <header className="fixed inset-x-0 top-0 z-40  bg-slate-900/70 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 h-20 md:h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/afi-reservas.png"
              alt="AFI Reservas"
              className="h-14 w-auto object-contain md:h-20"
            />
          </div>
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-slate-200 hover:bg-slate-700">
                  {avatarError ? (
                    <User className="w-7 h-7 rounded-full bg-slate-600 p-1" />
                  ) : (
                    <img
                      src={userAvatarUrl}
                      alt={userName}
                      className="w-7 h-7 rounded-full object-fill border border-slate-600"
                      onError={() => setAvatarError(true)}
                    />
                  )}
                  <span className="hidden md:inline max-w-[160px] truncate">{userName}</span>
                  <ChevronDown className="w-4 h-4 opacity-70" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="bottom"
                align="end"
                className="w-56 border-slate-700 bg-slate-900 p-1"
              >
                <button
                  onClick={() => setShowUserInfo(true)}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-slate-200 hover:bg-slate-800"
                >
                  <Info className="h-4 w-4" />
                  <span>Info</span>
                </button>
                <ConfirmDialog
                  open={logoutConfirmOpen}
                  onOpenChange={setLogoutConfirmOpen}
                  onConfirm={handleLogout}
                  title="Cerrar sesión"
                  description="Es una simulación de cierre de sesión."
                  confirmText="Cerrar sesión"
                >
                  <button
                    onClick={() => setLogoutConfirmOpen(true)}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-red-500 hover:bg-slate-800"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar sesion</span>
                  </button>
                </ConfirmDialog>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>
      <div className="mx-auto min-h-screen max-w-7xl space-y-6 p-6 pt-24 md:pt-28 justify-between flex flex-col flex-1">
        <div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between space-y-6 py-6">
            <div className="grid items-center gap-2">
              <CustomSelect
                label="Fondo activo:"
                value={currentFund?.id}
                options={funds.map((f) => ({
                  value: f.id,
                  label: f.name,
                  iconSrc: resolveFundIconSrc(f),
                }))}
                onValueChange={setCurrentFundId}
              />
            </div>
            <div className="text-sm text-slate-400">
              Comisión anual:{" "}
              <span className="font-medium text-[#3c84c2ff]">
                {currentFund?.adminFeePct ?? 0}%
              </span>
              <div className="mt-1 text-xs text-slate-500">
                Tiempo del fondo: {fundDurationText}
              </div>
            </div>
          </div>
        

          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="border-slate-600 bg-slate-800">
              <TabsTrigger value="dashboard">
                <span className="flex items-center gap-2">
                  <LineChart className="h-4 w-4" />
                  <span>Dashboard</span>
                </span>
              </TabsTrigger>
              <TabsTrigger value="data">
                <span className="flex items-center gap-2">
                  <Table className="h-4 w-4" />
                  <span>Datos</span>
                </span>
              </TabsTrigger>
              <TabsTrigger value="import">
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Importar</span>
                </span>
              </TabsTrigger>
              <TabsTrigger value="settings">
                <span className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  <span>Fondos</span>
                </span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard" className="mt-4">
              <DashboardView
                rows={rowsOfFund}
                shouldAnimate={startKpiAnimation && !hasAnimatedOnce}
                onAnimated={() => {
                  setHasAnimatedOnce(true);
                  try {
                    sessionStorage.setItem("kpiAnimatedOnce", "1");
                  } catch {}
                }}
              />
            </TabsContent>
            <TabsContent value="data" className="mt-4">
              <DataPageView
                rows={movements}
                currentFundId={currentFund?.id || ""}
                funds={funds}
                onAddRow={createMovement}
                onUpdateRow={updateMovement}
                onDeleteRow={deleteMovement}
              />
            </TabsContent>
            <TabsContent value="import" className="mt-4">
              {currentFund && (
                <ImportAccountStatements
                  currentFund={currentFund}
                  onImportComplete={() => reload()}
                />
              )}
            </TabsContent>
            <TabsContent value="settings" className="mt-4">
              <div className="mb-4 rounded-xl border border-slate-700 bg-slate-800/40">
                <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
                  <h3 className="font-semibold text-slate-200">
                    Mis Fondos de inversión
                  </h3>
                  <button
                    onClick={addFund}
                    className="rounded-md bg-slate-200 px-3 py-1.5 text-sm text-slate-900 hover:bg-white"
                  >
                    Agregar fondo
                  </button>
                </div>
                <ul className="divide-y divide-slate-700">
                  {funds.map((f) => {
                    const iconSrc = resolveFundIconSrc(f);
                    const isActive = f.id === currentFundId;
                    return (
                      <li
                        key={f.id}
                        className={`flex items-center justify-between px-4 py-3 ${isActive ? "bg-slate-800/60" : ""}`}
                      >
                        <button
                          onClick={() => setCurrentFundId(f.id)}
                          className="flex items-center gap-3 text-left"
                        >
                          <div className="rounded-md border border-slate-700 bg-slate-900/60 p-2 text-[#3677afff]">
                            <FundIcon src={iconSrc} size={22} />
                          </div>
                          <div>
                            <div className="font-medium text-slate-100">
                              {f.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              Comisión anual {f.adminFeePct}%
                            </div>
                          </div>
                        </button>
                        <div className="flex items-center gap-2">
                          {isActive && (
                            <span
                              title="Activo"
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-green-300"
                            >
                              <Check className="h-4 w-4" />
                            </span>
                          )}
                          <button
                            title="Información del fondo"
                            onClick={() => setInfoTarget(f)}
                            className="flex items-center justify-center rounded-lg p-2 text-[#3c84c2ff] transition-all duration-200 hover:text-sky-200"
                          >
                            <Info className="h-4 w-4" />
                          </button>
                          <ConfirmDialog
                            open={deleteTarget?.id === f.id}
                            onOpenChange={(open) =>
                              setDeleteTarget(open ? f : null)
                            }
                            onConfirm={() => handleDeleteFund(f)}
                            title="Eliminar fondo"
                            description={`¿Seguro que deseas eliminar "${f.name}"? Esta acción no se puede deshacer.`}
                          >
                            <button
                              title="Eliminar fondo"
                              className="flex items-center justify-center rounded-lg p-2 text-red-500 transition-all duration-200 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </ConfirmDialog>
                        </div>
                      </li>
                    );
                  })}
                  {funds.length === 0 && (
                    <li className="px-4 py-6 text-center text-slate-400">
                      Aún no tienes fondos. Agrega uno para comenzar.
                    </li>
                  )}
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Footer corporativo */}
        <Footer />
      </div>

      {/* User Info Dialog */}
      {showUserInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 backdrop-blur-sm md:backdrop-blur-md"
            onClick={() => setShowUserInfo(false)}
          ></div>
          <div className="relative z-10 mx-4 w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-4">
            <div className="mb-3 flex items-center gap-3">
              <img
                src={userAvatarUrl}
                alt={userName}
                className="h-12 w-12 rounded-full border border-slate-700 object-cover"
              />
              <div>
                <div className="font-semibold text-slate-100">{userName}</div>
                <div className="text-xs text-slate-400">Perfil de usuario</div>
              </div>
            </div>
            <p className="text-sm text-slate-300">
              Este es un perfil de demostración. Puedes personalizarlo poniéndote
              en contacto con el desarrollador darlingf1998@gmail.com.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                className="rounded bg-slate-200 px-3 py-1.5 text-slate-900 hover:bg-white"
                onClick={() => setShowUserInfo(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialogo para seleccionar fondo predefinido */}
      {showAddFundDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 backdrop-blur-sm md:backdrop-blur-md"
            onClick={() => setShowAddFundDialog(false)}
          ></div>
          <div className="relative z-10 mx-4 w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-100">
                Selecciona un prodcuto
              </h3>
              <button
                className="text-slate-400 hover:text-white"
                onClick={() => setShowAddFundDialog(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-slate-400">
              Elige entre los fondos de inversiones disponibles.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 overflow-auto max-h-[70vh]">
              {FUND_PRESETS.filter(
                (p) =>
                  !funds.some((f) => getFundPresetKeyFromFund(f) === p.key),
              ).map((p) => (
                <button
                  key={p.key}
                  onClick={() => createFundFromPreset(p.key)}
                  className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/50 p-3 text-left hover:bg-slate-800"
                >
                  <div className="rounded-md border border-slate-700 bg-slate-900/60 p-2 text-[#3677afff]">
                    <FundIcon src={p.icon} size={22} />
                  </div>
                  <div>
                    <div className="font-medium text-slate-100">{p.name}</div>
                    <div className="text-xs text-slate-400">
                      Comisión anual {p.adminFeePct}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {FUND_PRESETS.filter(
              (p) => !funds.some((f) => getFundPresetKeyFromFund(f) === p.key),
            ).length === 0 && (
              <div className="py-6 text-center text-slate-400">
                Ya agregaste todos los fondos predefinidos.
              </div>
            )}
          </div>
        </div>
      )}
      {/* Info del fondo */}
      <FundInfoDialog
        fund={infoTarget}
        open={!!infoTarget}
        onOpenChange={(o) => (!o ? setInfoTarget(null) : undefined)}
      />
    </div>
  );
}
