import { Check, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { checkWhitelist, clearWhitelist, login, register } from "../features/authSlice";
import { useAppDispatch, useAppSelector } from "../hooks";

export function AuthPage() {
  const dispatch = useAppDispatch();
  const { whitelistFound, whitelistProfile, isLoading, error } = useAppSelector((state) => state.auth);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const normalizedEmail = email.trim();
  const shouldShowValidation = normalizedEmail.includes("@") && normalizedEmail.includes(".");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (shouldShowValidation) {
        dispatch(checkWhitelist(normalizedEmail));
      } else {
        dispatch(clearWhitelist());
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [dispatch, normalizedEmail, shouldShowValidation]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    dispatch(mode === "login" ? login({ email: normalizedEmail, password }) : register({ email: normalizedEmail, password }));
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="brand auth-brand">
          Carp<span>uni</span>
        </div>
        <p className="muted">ПНУ ім. В. Стефаника · Івано-Франківськ</p>

        <div className="tabs">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            Вхід
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Реєстрація
          </button>
        </div>

        <label>
          Email університету
          <div className="validated-input">
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
            {shouldShowValidation ? (
              <span className={whitelistFound ? "ok" : "bad"}>
                {whitelistFound ? <Check size={16} /> : <X size={16} />}
                {whitelistFound ? "знайдено" : "не знайдено"}
              </span>
            ) : null}
          </div>
        </label>

        <label>
          Пароль
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>

        {whitelistProfile ? (
          <div className="identity-box">
            <strong>{whitelistProfile.displayName}</strong>
            <span>
              {whitelistProfile.role} · {whitelistProfile.faculty}
              {whitelistProfile.group ? ` · ${whitelistProfile.group}` : ""}
            </span>
          </div>
        ) : null}

        {error ? (
          <p className="auth-alert" role="alert">
            {error}
          </p>
        ) : null}

        <button className="primary-button" disabled={!whitelistFound || !password || isLoading}>
          {mode === "login" ? "Увійти" : "Зареєструватись"}
        </button>

        <p className="auth-note">
          Email звіряється з базою університету. Роль, факультет і група визначаються автоматично.
        </p>
      </form>
    </div>
  );
}
