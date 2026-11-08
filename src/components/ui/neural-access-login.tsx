import { useRef, type FormEvent, type PointerEvent } from "react";
import "./neural-access-login.css";

interface NeuralAccessLoginProps {
  email: string;
  password: string;
  error: string;
  pending: boolean;
  remember: boolean;
  onRememberChange: (value: boolean) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

// Fixed positions keep server and client rendering identical.
const blobs = [
  { size: 310, left: 10, top: 12, delay: -3, duration: 24 },
  { size: 240, left: 67, top: 8, delay: -12, duration: 30 },
  { size: 350, left: 77, top: 60, delay: -7, duration: 23 },
  { size: 230, left: 2, top: 75, delay: -17, duration: 32 },
  { size: 190, left: 46, top: 72, delay: -9, duration: 27 },
  { size: 210, left: 37, top: 2, delay: -15, duration: 29 },
];

export function NeuralAccessLogin({ email, password, error, pending, remember, onRememberChange, onEmailChange, onPasswordChange, onSubmit }: NeuralAccessLoginProps) {
  const stage = useRef<HTMLDivElement>(null);
  function move(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    stage.current?.style.setProperty("--pointer-x", `${(event.clientX / window.innerWidth - 0.5) * 24}px`);
    stage.current?.style.setProperty("--pointer-y", `${(event.clientY / window.innerHeight - 0.5) * 24}px`);
  }
  return (
    <main className="neural-login" onPointerMove={move}>
      <svg className="neural-filter" aria-hidden="true" focusable="false">
        <defs><filter id="neural-goo"><feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" /><feComposite in="SourceGraphic" in2="goo" operator="atop" /></filter></defs>
      </svg>
      <div className="neural-stage" ref={stage} aria-hidden="true">
        {blobs.map((blob, index) => <div key={index} className="neural-blob" style={{ width: blob.size, height: blob.size, left: `${blob.left}%`, top: `${blob.top}%`, animationDelay: `${blob.delay}s`, animationDuration: `${blob.duration}s` }} />)}
      </div>
      <section className="neural-container" aria-labelledby="neural-title">
        <header className="neural-header">
          <img src="/dpo-logo.png" alt="ຕາສັນຍາລັກ DPO" className="neural-logo" />
          <h1 id="neural-title">ລະບົບບໍລິຫານ Website</h1>
          <p>ເຂົ້າສູ່ລະບົບຈັດການຂໍ້ມູນ Website DPO</p>
        </header>
        <form onSubmit={onSubmit}>
          <div className="neural-field"><label htmlFor="login-email">ອີເມວ</label><input id="login-email" type="email" required autoComplete="username" value={email} onChange={e => onEmailChange(e.target.value)} placeholder="name@example.com" /><span className="neural-input-glow" /></div>
          <div className="neural-field"><label htmlFor="login-password">ລະຫັດຜ່ານ</label><input id="login-password" type="password" required autoComplete="current-password" value={password} onChange={e => onPasswordChange(e.target.value)} placeholder="••••••••" /><span className="neural-input-glow" /></div>
          <label className="neural-remember"><input type="checkbox" checked={remember} onChange={e => onRememberChange(e.target.checked)} /> ຈື່ການເຂົ້າລະບົບ</label>
          {error && <p role="alert" className="neural-error">{error}</p>}
          <div className="neural-submit"><button type="submit" disabled={pending}>{pending ? "ກຳລັງເຂົ້າລະບົບ..." : "ເຂົ້າລະບົບ"}<span aria-hidden="true">↗</span></button></div>
        </form>
      </section>
    </main>
  );
}
