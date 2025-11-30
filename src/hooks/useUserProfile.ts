import { useState, useEffect, useMemo } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export function useUserProfile() {
  const [docIdAlias, setDocIdAlias] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userAvatarUrl, setUserAvatarUrl] = useState<string>("/avatars/fajardo.jpeg");
  const [avatarError, setAvatarError] = useState(false);

  const isDemoAccount = useMemo(() => docIdAlias === "001-1234567-8", [docIdAlias]);

  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (u) => {
      const email = u?.email || "";
      const id = email ? email.split("@")[0] : "";
      setDocIdAlias(id);
      setUserName(u?.displayName || "");
      setUserAvatarUrl(u?.photoURL || "/avatars/fajardo.jpeg");

      if (u) {
        // Usar onSnapshot para escuchar cambios en tiempo real
        const unsubSnapshot = onSnapshot(doc(db, "users", u.uid), (snap) => {
          const data = snap.exists() ? (snap.data() as any) : null;
          if (data) {
            if (data.displayName) {
              setUserName(data.displayName);
            }
            const fsUrl = data.photoURL;
            if (typeof fsUrl === "string" && fsUrl.length > 10) {
              setAvatarError(false);
              setUserAvatarUrl(fsUrl);
            }
          }
        });
        return () => unsubSnapshot();
      }
    });
    return () => unsub();
  }, []);

  // Si falla la carga del avatar, intentar recuperar desde Firestore como segundo intento
  useEffect(() => {
    if (!avatarError) return;
    const u = auth.currentUser;
    if (!u) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        const data = snap.exists() ? (snap.data() as any) : null;
        const fsUrl = data?.photoURL;
        if (typeof fsUrl === "string" && fsUrl.length > 10) {
          setAvatarError(false);
          setUserAvatarUrl(fsUrl);
        }
      } catch {}
    })();
  }, [avatarError]);

  return {
    docIdAlias,
    userName,
    userAvatarUrl,
    avatarError,
    setAvatarError,
    isDemoAccount,
  };
}
