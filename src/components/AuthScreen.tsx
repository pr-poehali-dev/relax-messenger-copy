import { useState } from "react";
import Icon from "@/components/ui/icon";

type Mode = "login" | "register";

type Props = {
  onAuth: (user: { username: string; phone: string }) => void;
};

const STORAGE_KEY = "relax_users";
const SESSION_KEY = "relax_session";

function getUsers(): Record<string, { username: string; phone: string; password: string }> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveUser(phone: string, data: { username: string; phone: string; password: string }) {
  const users = getUsers();
  users[phone] = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function saveSession(user: { username: string; phone: string }) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): { username: string; phone: string } | null {
  try {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  let result = "+";
  if (digits.length > 0) result += digits[0];
  if (digits.length > 1) result += " (" + digits.slice(1, 4);
  if (digits.length > 4) result += ") " + digits.slice(4, 7);
  if (digits.length > 7) result += "-" + digits.slice(7, 9);
  if (digits.length > 9) result += "-" + digits.slice(9, 11);
  return result;
}

export default function AuthScreen({ onAuth }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handlePhoneInput(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    setPhone(digits);
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (phone.length < 11) {
      setError("Введите полный номер телефона");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const users = getUsers();

      if (mode === "register") {
        if (!username.trim()) {
          setError("Введите имя пользователя");
          return;
        }
        if (users[phone]) {
          setError("Аккаунт с таким номером уже существует");
          return;
        }
        const user = { username: username.trim(), phone, password };
        saveUser(phone, user);
        const session = { username: user.username, phone };
        saveSession(session);
        onAuth(session);
      } else {
        const user = users[phone];
        if (!user) {
          setError("Аккаунт не найден. Зарегистрируйтесь");
          return;
        }
        if (user.password !== password) {
          setError("Неверный пароль");
          return;
        }
        const session = { username: user.username, phone };
        saveSession(session);
        onAuth(session);
      }
    }, 600);
  }

  function switchMode() {
    setMode(mode === "login" ? "register" : "login");
    setError("");
    setPassword("");
    setUsername("");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #ede8de 0%, #e4ddd1 50%, #ddd5c8 100%)",
        fontFamily: "'Rubik', sans-serif",
      }}
    >
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#6b8f71]/10 blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[350px] h-[350px] rounded-full bg-[#c9956e]/10 blur-[80px]" />
      </div>

      <div className="relative w-full max-w-[380px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#6b8f71] flex items-center justify-center shadow-lg shadow-[#6b8f71]/25 mb-4">
            <span className="text-2xl">🌿</span>
          </div>
          <h1 className="text-[#3d3530] font-semibold text-2xl leading-none">Relax</h1>
          <p className="text-[#a09387] text-xs mt-1.5 tracking-widest uppercase">Мессенджер</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-7 shadow-xl shadow-[#3d3530]/8 border border-white/60">
          {/* Tab switcher */}
          <div className="flex bg-[#f0ebe0] rounded-2xl p-1 mb-6">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); setPassword(""); setUsername(""); }}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${mode === m
                    ? "bg-white text-[#3d3530] shadow-sm"
                    : "text-[#a09387] hover:text-[#6b7a6b]"
                  }`}
              >
                {m === "login" ? "Войти" : "Регистрация"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-[#8a7d72] mb-1.5 ml-1">
                Номер телефона
              </label>
              <div className="relative">
                <Icon name="Phone" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a09387]" />
                <input
                  type="tel"
                  value={formatPhone(phone)}
                  onChange={handlePhoneInput}
                  placeholder="+7 (999) 000-00-00"
                  autoComplete="tel"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f8f4ed] border border-[#e8e0d4] text-[#3d3530] placeholder-[#c9bdb2] text-sm outline-none focus:border-[#6b8f71] focus:ring-2 focus:ring-[#6b8f71]/15 transition-all"
                />
              </div>
            </div>

            {/* Username — только при регистрации */}
            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium text-[#8a7d72] mb-1.5 ml-1">
                  Имя пользователя
                </label>
                <div className="relative">
                  <Icon name="User" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a09387]" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(""); }}
                    placeholder="Ваше имя"
                    autoComplete="name"
                    maxLength={32}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f8f4ed] border border-[#e8e0d4] text-[#3d3530] placeholder-[#c9bdb2] text-sm outline-none focus:border-[#6b8f71] focus:ring-2 focus:ring-[#6b8f71]/15 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-[#8a7d72] mb-1.5 ml-1">
                Пароль
              </label>
              <div className="relative">
                <Icon name="Lock" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a09387]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder={mode === "register" ? "Минимум 6 символов" : "Ваш пароль"}
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#f8f4ed] border border-[#e8e0d4] text-[#3d3530] placeholder-[#c9bdb2] text-sm outline-none focus:border-[#6b8f71] focus:ring-2 focus:ring-[#6b8f71]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a09387] hover:text-[#6b8f71] transition-colors"
                >
                  <Icon name={showPassword ? "EyeOff" : "Eye"} size={15} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100">
                <Icon name="AlertCircle" size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-red-500 text-xs">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#6b8f71] hover:bg-[#5a7a60] text-white font-medium text-sm transition-all duration-200 shadow-md shadow-[#6b8f71]/25 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Icon name="Loader" size={15} className="animate-spin" />
                  <span>{mode === "login" ? "Входим..." : "Создаём аккаунт..."}</span>
                </>
              ) : (
                <span>{mode === "login" ? "Войти" : "Создать аккаунт"}</span>
              )}
            </button>
          </form>

          {/* Switch mode hint */}
          <p className="text-center text-xs text-[#a09387] mt-5">
            {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
            <button
              onClick={switchMode}
              className="text-[#6b8f71] font-medium hover:underline transition-all"
            >
              {mode === "login" ? "Зарегистрироваться" : "Войти"}
            </button>
          </p>
        </div>

        <p className="text-center text-[11px] text-[#b0a498] mt-6">
          Регистрируясь, вы соглашаетесь с условиями использования
        </p>
      </div>
    </div>
  );
}
