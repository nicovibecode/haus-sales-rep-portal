import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / wordmark */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-stone-800 rounded-sm" />
            <span className="text-2xl font-semibold tracking-tight text-stone-800">
              BSD Haus
            </span>
          </div>
          <p className="text-sm text-stone-500 mt-1">Sales Representative Portal</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-8">
          <h1 className="text-lg font-semibold text-stone-800 mb-6">Sign in</h1>
          <LoginForm />
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          BSD Haus LLC · Southern California Natural Stone &amp; Tile
        </p>
      </div>
    </main>
  );
}
