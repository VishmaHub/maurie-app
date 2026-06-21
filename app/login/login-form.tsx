interface LoginFormProps {
  readonly hasInvalidLoginError: boolean;
  readonly nextPath: string;
}

export function LoginForm(props: LoginFormProps) {
  return (
    <form action="/api/auth/login" method="post" className="mt-8 grid gap-4">
      <input type="hidden" name="next" value={props.nextPath} />

      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-semibold text-[var(--maurie-text)]">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-3xl border border-[var(--maurie-border)] bg-white/70 px-5 py-4 text-sm text-[var(--maurie-text)] outline-none transition focus:border-[var(--maurie-orange)] focus:ring-4 focus:ring-[rgba(234,109,48,0.16)]"
          placeholder="client@maurie.local"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-semibold text-[var(--maurie-text)]">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-3xl border border-[var(--maurie-border)] bg-white/70 px-5 py-4 text-sm text-[var(--maurie-text)] outline-none transition focus:border-[var(--maurie-orange)] focus:ring-4 focus:ring-[rgba(234,109,48,0.16)]"
          placeholder="Enter password"
        />
      </div>

      {props.hasInvalidLoginError ? (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-700">
          Invalid login details.
        </div>
      ) : null}

      <button type="submit" className="maurie-button-primary w-full">
        Sign in securely
      </button>
    </form>
  );
}
