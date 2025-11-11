import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Login from "./Login";
import LogoLoader from "@/components/LogoLoader";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [userPresent, setUserPresent] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUserPresent(!!user);
      setReady(true);
    });
    return () => unsub();
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        <LogoLoader />
      </div>
    );
  }

  if (!userPresent) {
    return <Login />;
  }

  return <>{children}</>;
}

export async function logout() {
  await signOut(auth);
}