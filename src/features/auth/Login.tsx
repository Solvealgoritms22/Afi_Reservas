import React, { useEffect, useMemo, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { doc, setDoc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomFileInput } from "@/components/ui/CustomFileInput";
import { LogIn, UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const DOC_ID_REGEX = /^[0-9]{3}-[0-9]{7}-[0-9]{1}$/;
const toEmail = (docId: string) => `${docId}@afi.local`;

function digitsOnly(value: string) {
  return (value || "").replace(/\D+/g, "");
}

function formatDocId(value: string) {
  const d = digitsOnly(value).slice(0, 11);
  // Inserta guiones en posiciones 3 y 10 => ###-#######-#
  const p1 = d.slice(0, 3);
  const p2 = d.slice(3, 10);
  const p3 = d.slice(10, 11);
  return [p1, p2, p3].filter(Boolean).join("-");
}

export default function Login() {
  const [docId, setDocId] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  const isDocValid = useMemo(() => DOC_ID_REGEX.test(docId.trim()), [docId]);
  const baseReady = isDocValid && password.trim().length >= 6 && !loading;
  const canSubmit = mode === "signup"
    ? baseReady && displayName.trim().length > 0 && !!photoFile
    : baseReady;

  const translateAuthError = (err: unknown, currentMode: "login" | "signup") => {
    if (err instanceof FirebaseError) {
      const c = err.code;
      switch (c) {
        case "auth/invalid-email":
          return "Documento inválido.";
        case "auth/user-not-found":
          return currentMode === "login"
            ? "Usuario inexistente. ¿Deseas crear una cuenta?"
            : "No se pudo encontrar el usuario.";
        case "auth/wrong-password":
          return "Contraseña incorrecta. Verifica e intenta de nuevo.";
        case "auth/email-already-in-use":
          return "Ya existe una cuenta para este documento.";
        case "auth/weak-password":
          return "Contraseña débil. Usa al menos 6 caracteres.";
        case "auth/too-many-requests":
          return "Demasiados intentos. Intenta nuevamente más tarde.";
        case "auth/network-request-failed":
          return "Sin conexión o fallo de red. Verifica tu internet.";
        case "auth/operation-not-allowed":
          return "Operación no permitida en Auth (revisa configuración).";
        default:
          return "Error de autenticación. Intenta de nuevo.";
      }
    }
    return "Error de autenticación.";
  };

  // Convierte el archivo seleccionado en un avatar cuadrado (cover) y lo
  // serializa como data URL (webp) para almacenarlo en Firestore y usarlo en Auth.
  async function fileToAvatarDataUrl(file: File, size = 256): Promise<string> {
    try {
      const imgUrl = URL.createObjectURL(file);
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = (e) => reject(new Error("No se pudo cargar la imagen"));
        el.src = imgUrl;
      });
      const s = Math.min(img.width, img.height);
      const sx = (img.width - s) / 2;
      const sy = (img.height - s) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas no disponible");
      ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.9),
      );
      URL.revokeObjectURL(imgUrl);
      if (!blob) {
        // Fallback a dataURL original
        const asDataUrl = await new Promise<string>((resolve, reject) => {
          const fr = new FileReader();
          fr.onloadend = () => resolve(fr.result as string);
          fr.onerror = reject;
          fr.readAsDataURL(file);
        });
        return asDataUrl;
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onloadend = () => resolve(fr.result as string);
        fr.onerror = reject;
        fr.readAsDataURL(blob);
      });
      return dataUrl;
    } catch (e) {
      // Último recurso: dataURL directo del archivo
      const asDataUrl = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onloadend = () => resolve(fr.result as string);
        fr.onerror = reject;
        fr.readAsDataURL(file);
      });
      return asDataUrl;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!canSubmit) return;
    setLoading(true);
    try {
      const email = toEmail(docId.trim());
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password.trim());
      } else {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email,
          password.trim(),
        );
        // Asegurar que el token de Auth esté emitido antes de usar Storage
        try { await cred.user.getIdToken(true); } catch {}
        // Generar data URL del avatar y guardarlo en Firestore (sin usar Storage)
        let photoURL: string | undefined = undefined;
        if (photoFile) {
          try {
            photoURL = await fileToAvatarDataUrl(photoFile, 256);
          } catch (err) {
            console.error("Error procesando avatar:", err);
            toast.error("No se pudo procesar la imagen de perfil.");
          }
        }

        // Actualizar perfil en Firebase Auth
        await updateProfile(cred.user, {
          displayName: displayName.trim(),
          photoURL: photoURL,
        });

        // Forzar la recarga del perfil del usuario para obtener los datos actualizados
        await cred.user.reload();

        // Guardar metadata del usuario en Firestore
        await setDoc(doc(db, "users", cred.user.uid), {
          docId: docId.trim(),
          displayName: displayName.trim(),
          photoURL: photoURL || null,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      const msg = translateAuthError(err, mode);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError(null);
    const email = toEmail(docId.trim());
    if (!DOC_ID_REGEX.test(docId.trim())) {
      setError("Ingresa tu documento en formato válido para recuperar.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Si el correo existe, se envió enlace de recuperación.");
    } catch (err) {
      const msg = translateAuthError(err, "login");
      setError(msg);
    }
  };

  return (
    <div className="grid place-content-center h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl items-center justify-center p-6">
        <Card className={`w-full border-slate-700/60 bg-slate-900/90 shadow-xl shadow-slate-900/30 transition-all duration-300 ease-out transform ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
          <CardHeader>
            <div className="flex items-center justify-center gap-3">
              <img
                src="/afi-reservas.png"
                alt="AFI Reservas"
                className="h-16 w-auto"
              />
            </div>
            <CardTitle className="mt-2 text-center text-xl font-semibold text-slate-100">
              {mode === "login" ? "Bienvenido a AFI Reservas" : "Crea tu cuenta"}
            </CardTitle>
            <CardDescription className="text-center text-slate-400 pb-8">
              Inicia sesión con tu documento de identidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-5 px-4">
              <div>
                <label className="block text-sm text-slate-300">Documento de identidad</label>
                <input
                  value={docId}
                  onChange={(e) => setDocId(formatDocId(e.target.value))}
                  placeholder="000-0000000-0"
                  autoFocus
                  inputMode="numeric"
                  aria-label="Documento de identidad"
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 p-2.5 text-slate-100 placeholder:text-slate-500 transition-all duration-200 hover:border-slate-600 focus:border-[#3c84c2ff] focus:ring-2 focus:ring-[#3c84c2ff]/50 focus:outline-none"
                />
                
              </div>
              {mode === "signup" && (
                <div>
                  <label className="block text-sm text-slate-300">Nombre completo</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Juan Pérez"
                    aria-label="Nombre completo"
                    className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 p-2.5 text-slate-100 placeholder:text-slate-500 transition-all duration-200 hover:border-slate-600 focus:border-[#3c84c2ff] focus:ring-2 focus:ring-[#3c84c2ff]/50 focus:outline-none"
                  />
                  {displayName.trim().length === 0 && (
                    <div className="mt-1 text-xs text-red-400">El nombre es obligatorio.</div>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm text-slate-300">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    aria-label="Contraseña"
                    className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 p-2.5 pr-10 text-slate-100 placeholder:text-slate-500 transition-all duration-200 hover:border-slate-600 focus:border-[#3c84c2ff] focus:ring-2 focus:ring-[#3c84c2ff]/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-[#3c84c2ff]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && password.length < 6 && (
                  <div className="mt-1 text-xs text-red-400">Mínimo 6 caracteres.</div>
                )}
                <div className="mt-4 text-center text-sm text-slate-300 bg-slate-800/50 rounded-lg p-3 border border-slate-700/60">
                  <p className="font-bold text-slate-100">Cuenta de Demostración</p>
                  <p className="mt-2">
                    <span className="font-semibold text-slate-400">Usuario:</span>{" "}
                    <code className="text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded">
                      001-1234567-8
                    </code>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-400">Contraseña:</span>{" "}
                    <code className="text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded">
                      qwer1234
                    </code>
                  </p>
                </div>
                <div className="mt-2 text-right hidden">
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="text-xs text-[#3c84c2ff] hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div> 
              {mode === "signup" && (
                <div>
                  <CustomFileInput
                    label="Foto de perfil"
                    accept="image/*"
                    buttonText="Elegir foto"
                    placeholder="Ningún archivo seleccionado"
                    selectedFileName={photoFile?.name || null}
                    file={photoFile}
                    showPreview
                    previewSize={48}
                    onFileSelected={(file) => {
                      setPhotoFile(file);
                      setPhotoPreview(file ? URL.createObjectURL(file) : "");
                    }}
                  />
                  {!photoFile && (
                    <div className="mt-1 text-xs text-red-400">La foto es obligatoria.</div>
                  )}
                </div>
              )}
              {error && (
                <div className="rounded-md border border-red-500/50 bg-red-900/20 p-2 text-sm text-red-200">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full group relative flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#3677afff] to-[#3c84c2ff] text-white shadow-lg shadow-[#3c84c2]/20 transition-all duration-200 hover:from-[#3c84c2ff] hover:to-[#60a5fa] hover:shadow-[#60a5fa]/30 focus-visible:ring-2 focus-visible:ring-[#3c84c2ff] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mode === "login" ? "Entrando..." : "Creando cuenta..."}
                  </>
                ) : (
                  <>
                    {mode === "login" ? (
                      <LogIn className="h-4 w-4" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                    {mode === "login" ? "Entrar" : "Crear cuenta"}
                  </>
                )}
              </Button>
              <div className="text-center text-sm text-slate-400 hidden">
                {mode === "login" ? (
                  <button
                    type="button"
                    className="text-[#3c84c2ff] hover:underline"
                     // onClick={() => setMode("signup")}
                  >
                    ¿No tienes cuenta? Crear una nueva
                  </button>
                ) : (
                  <button
                    type="button"
                    className="text-[#3c84c2ff] hover:underline"
                    onClick={() => setMode("login")}
                  >
                    Ya tengo cuenta, iniciar sesión
                  </button>
                )}
              </div>
              <div className="text-center text-xs text-slate-500 pb-6">
                Tu documento se utiliza como usuario interno. Tus datos están protegidos.
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}