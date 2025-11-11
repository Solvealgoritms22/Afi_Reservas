import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Login from "./Login";
import { Loader2 } from "lucide-react";

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
      <div className="flex min-h-screen items-center justify-center text-slate-300">
        <Loader2 className="h-10 w-10 animate-spin" />
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