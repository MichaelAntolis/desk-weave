"use client";

import Link from "next/link";
import { User, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { register } from "@/lib/actions/auth";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"TENANT" | "OWNER">("TENANT");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("peran", selectedRole);

    const result = await register(formData);
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
            Ruang kerja yang terkurasi untuk produktivitas maksimal.
          </h1>
          <p className="text-white/80 text-lg leading-relaxed mb-10">
            Masuki ekosistem ruang kerja paling cerdas di Indonesia. Baik Anda seorang pengembara digital atau pemilik properti yang ingin memaksimalkan aset.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-dashboard text-secondary mb-2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
              <h3 className="text-white font-bold">Smart Management</h3>
              <p className="text-white/60 text-xs mt-1">Kelola pemesanan dengan sekali ketuk.</p>
            </div>
            <div className="p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-badge-check text-secondary mb-2"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>
              <h3 className="text-white font-bold">Verified Spaces</h3>
              <p className="text-white/60 text-xs mt-1">Kualitas ruang terjamin dan terkurasi.</p>
            </div>
          </div>
        </div>
        {/* Floating Testimonial */}
        <div className="absolute bottom-10 right-10 bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-secondary">
            <img
              alt="User"
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80"
            />
          </div>
          <div>
            <p className="text-white text-sm font-bold">&quot;Efisiensi meningkat 40%&quot;</p>
            <p className="text-white/50 text-xs">Ahmad, Digital Architect</p>
          </div>
        </div>
      </div>

      {/* Form Column */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-on-surface-variant mt-2 font-body">
              Mulai perjalanan Anda di ekosistem DeskWeave.
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm font-medium">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-label font-semibold text-on-surface-variant block">
                Pilih Peran Anda
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedRole("TENANT")}
                  className={`p-4 rounded-xl bg-surface-container border-2 transition-all duration-300 text-left ${
                    selectedRole === "TENANT"
                      ? "border-secondary bg-surface"
                      : "border-transparent"
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <User className="text-secondary w-5 h-5" />
                  </div>
                  <span className="block font-bold text-on-surface font-headline">Penyewa</span>
                  <span className="block text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">
                    Cari Ruang Kerja
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("OWNER")}
                  className={`p-4 rounded-xl bg-surface-container border-2 transition-all duration-300 text-left ${
                    selectedRole === "OWNER"
                      ? "border-primary bg-surface"
                      : "border-transparent"
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-store text-primary"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-9"/><path d="M14 22v-9"/><path d="M14 12v8a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-8"/><path d="M2 9h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
                  </div>
                  <span className="block font-bold text-on-surface font-headline">Pemilik</span>
                  <span className="block text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">
                    Kelola Properti
                  </span>
                </button>
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-on-surface-variant font-label">Nama Lengkap</Label>
                <Input
                  id="name"
                  name="nama_lengkap"
                  placeholder="John Doe"
                  required
                  className="bg-surface-container-lowest border-none shadow-sm focus-visible:ring-2 focus-visible:ring-secondary py-6"
                />
              </div>
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
                <Label htmlFor="password" className="text-on-surface-variant font-label">Password</Label>
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

            {/* Terms */}
            <div className="flex items-start space-x-2">
              <Checkbox id="terms" required className="mt-1 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary" />
              <Label
                htmlFor="terms"
                className="text-sm text-on-surface-variant font-normal leading-relaxed"
              >
                Saya menyetujui{" "}
                <Link href="#" className="text-primary font-bold hover:underline">
                  Syarat & Ketentuan
                </Link>{" "}
                serta{" "}
                <Link href="#" className="text-primary font-bold hover:underline">
                  Kebijakan Privasi
                </Link>{" "}
                DeskWeave.
              </Label>
            </div>

            {/* CTA */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 rounded-lg gradient-primary text-white font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all outline-none border-none disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Membuat Akun...
                </span>
              ) : (
                "Daftar Sekarang"
              )}
            </Button>
            
            <p className="text-center text-sm text-on-surface-variant mt-8">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-secondary font-bold hover:underline">
                Masuk di sini
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
