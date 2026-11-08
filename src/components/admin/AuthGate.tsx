import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest, clearSession, getSessionToken, saveSession } from "@/lib/api/client";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { NeuralAccessLogin } from "@/components/ui/neural-access-login";

type User = { name: string; role: string };

export function AuthGate({ children }: { children: (user: User, logout: () => void) => ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [remember, setRemember] = useState(false);
  useEffect(() => {
    const expired = () => { setUser(null); queryClient.clear(); };
    window.addEventListener("dpo-session-expired", expired);
    if (getSessionToken()) {
      apiRequest<User>("/api/auth/me").then(setUser).catch(() => setError("ບໍ່ສາມາດກວດສອບການເຂົ້າລະບົບໄດ້")).finally(() => setChecking(false));
    } else setChecking(false);
    return () => window.removeEventListener("dpo-session-expired", expired);
  }, [queryClient]);
  async function login(e: FormEvent) {
    e.preventDefault(); setError(""); setPending(true);
    try {
      const result = await apiRequest<{ accessToken: string; user: User }>("/api/auth/login", { method: "POST", body: { email, password } });
      saveSession(result.accessToken, remember);
      setPassword(""); setUser(result.user);
    } catch { setError("ເຂົ້າລະບົບບໍ່ສຳເລັດ ກະລຸນາກວດສອບອີເມວ, ລະຫັດຜ່ານ ແລະການເຊື່ອມຕໍ່"); }
    finally { setPending(false); }
  }
  if (checking) return <main className="grid min-h-screen place-items-center bg-background p-4"><LoadingSkeleton className="panel w-full max-w-sm" /></main>;
  if (!user) return <NeuralAccessLogin email={email} password={password} error={error} pending={pending} remember={remember} onRememberChange={setRemember} onEmailChange={setEmail} onPasswordChange={setPassword} onSubmit={login} />;
  return children(user, () => { clearSession(); queryClient.clear(); setUser(null); });
}
