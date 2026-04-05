"use client";

import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/actions/auth";

import AuthLayout from "@/components/layout/AuthLayout";

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense>
        <LoginContent />
      </Suspense>
    </AuthLayout>
  );
}

function LoginContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    if (redirectTo) {
      formData.set("redirectTo", redirectTo);
    }

    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <main className="flex-grow flex items-stretch min-h-screen">
      {/* Visual Column */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-primary-container">
        <div className="absolute inset-0 z-0">
          <img
            alt="Workspace Interior"
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"
          />
        </div>
        <div className="relative z-10 p-16 flex flex-col justify-center max-w-xl">
          <Link href="/" className="absolute top-12 left-16 text-3xl font-black tracking-tighter text-white font-headline">
            DeskWeave
          </Link>
          <span className="text-secondary font-label font-bold uppercase tracking-widest mb-4">
            The Digital Architect
          </span>
          <h1 className="text-5xl font-headline font-extrabold text-white leading-tight mb-6 tracking-tighter">
            Selamat datang kembali.
          </h1>
          <p className="text-white/80 text-lg leading-relaxed mb-10">
            Akses dashboard manajemen properti Anda atau temukan ruang kerja premium berikutnya di ekosistem DeskWeave.
          </p>
        </div>
      </div>

      {/* Form Column */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">
              Masuk
            </h2>
            <p className="text-on-surface-variant mt-2 font-body">
              Lanjutkan ke akun DeskWeave Anda.
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm font-medium">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Input Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-on-surface-variant font-label">Email Bisnis</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  className="bg-surface-container-lowest border-none shadow-sm focus-visible:ring-2 focus-visible:ring-secondary py-6"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-on-surface-variant font-label">Password</Label>
                  <Link href="#" className="text-xs font-bold text-secondary hover:underline">
                    Lupa Password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="bg-surface-container-lowest border-none shadow-sm focus-visible:ring-2 focus-visible:ring-secondary py-6"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 rounded-lg gradient-primary text-white font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all outline-none border-none disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses...
                </span>
              ) : (
                "Masuk"
              )}
            </Button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline/20"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface px-2 text-on-surface-variant font-medium">
                  Belum punya akun?
                </span>
              </div>
            </div>
            
            <p className="text-center text-sm text-on-surface-variant">
              <Link href="/register" className="text-secondary font-bold hover:underline">
                Daftar sekarang
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
