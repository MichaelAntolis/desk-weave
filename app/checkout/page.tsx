"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingBag, Landmark, UploadCloud, Info, ShieldCheck, Loader2, CheckCircle } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadBuktiPembayaran } from "@/lib/actions/pemesanan";
import type { Pemesanan, Ruangan } from "@/lib/types/database";

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("id");

  const [booking, setBooking] = useState<(Pemesanan & { ruangan?: Ruangan }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) {
        router.push("/");
        return;
      }

      const supabase = createClient();
      const { data } = await supabase
        .from("pemesanan")
        .select(`*, ruangan(*)`)
        .eq("id", bookingId)
        .single();

      if (!data) {
        router.push("/");
        return;
      }

      setBooking(data as Pemesanan & { ruangan?: Ruangan });
      setLoading(false);
    }

    fetchBooking();
  }, [bookingId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !bookingId) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.set("bukti", selectedFile);

    const result = await uploadBuktiPembayaran(bookingId, formData);

    if (result.error) {
      setError(result.error);
      setUploading(false);
      return;
    }

    setSuccess(true);
    setUploading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <Navbar />
        <main className="pt-24 pb-12 px-4 md:px-8 max-w-3xl mx-auto w-full flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mb-8">
            <CheckCircle className="w-12 h-12 text-secondary" />
          </div>
          <h1 className="text-3xl font-extrabold font-headline text-primary mb-4">
            Bukti Pembayaran Terkirim!
          </h1>
          <p className="text-on-surface-variant text-lg mb-8 max-w-md">
            Terima kasih! Bukti pembayaran Anda sedang menunggu verifikasi dari pemilik ruangan. Biasanya membutuhkan waktu 10-30 menit.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => router.push("/tenant/bookings")} className="gradient-primary font-bold px-8">
              Lihat Pemesanan Saya
            </Button>
            <Button onClick={() => router.push("/")} variant="outline" className="font-bold">
              Kembali ke Beranda
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const serviceFee = Math.round((booking?.total_harga || 0) * 0.05);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto w-full flex-1">
        {/* Header Section */}
        <header className="mb-12 relative overflow-hidden rounded-xl bg-primary-container p-8 md:p-12 text-white">
          <div className="relative z-10 md:w-2/3">
            <div className="inline-flex items-center px-3 py-1 bg-secondary text-white rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              Kode: {booking?.kode_pemesanan}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold font-headline tracking-tight leading-tight mb-4">
              Hampir Selesai!<br />Selesaikan Pembayaran Anda.
            </h1>
            <p className="text-on-primary-container text-base md:text-lg max-w-lg font-body">
              Pesanan Anda telah kami terima. Silakan lakukan transfer manual dan unggah bukti pembayaran agar tim kami dapat segera melakukan verifikasi.
            </p>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 hidden md:block">
            <img
              alt="Financial illustration"
              className="h-full w-full object-cover opacity-40 mix-blend-overlay"
              src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Order Summary & Instructions */}
          <div className="lg:col-span-8 space-y-8">
            {/* Order Summary Card */}
            <section className="bg-surface-container-low rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-bold font-headline mb-6 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-primary" />
                Ringkasan Pesanan
              </h2>

              <div className="bg-surface-container-lowest rounded-lg p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 border-b border-outline/10 pb-4">
                  <div>
                    <h3 className="font-bold text-lg font-headline">{booking?.ruangan?.nama || "Ruang Kerja"}</h3>
                    <p className="text-sm text-on-surface-variant font-body mt-1">
                      {booking?.tanggal_mulai} s.d. {booking?.tanggal_selesai}
                    </p>
                  </div>
                  <span className="font-bold text-primary text-lg">
                    {formatRupiah(booking?.total_harga || 0)}
                  </span>
                </div>

                <div className="pt-4 border-t border-outline/10 flex justify-between items-center">
                  <span className="text-lg font-bold font-headline">Total Pembayaran</span>
                  <span className="text-2xl font-black text-primary font-headline">
                    {formatRupiah(booking?.total_harga || 0)}
                  </span>
                </div>
              </div>
            </section>

            {/* Transfer Instructions */}
            <section className="bg-surface-container-low rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-bold font-headline mb-6 flex items-center gap-2">
                <Landmark className="w-6 h-6 text-primary" />
                Instruksi Transfer Bank
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border-l-4 border-primary">
                  <p className="text-xs font-bold text-on-surface-variant uppercase mb-2 tracking-widest font-label">
                    Bank Central Asia (BCA)
                  </p>
                  <p className="text-2xl font-black tracking-wider mb-1 font-headline text-primary">
                    8830 192 112
                  </p>
                  <p className="text-sm text-on-surface-variant font-body">
                    a.n. PT DeskWeave Teknologi
                  </p>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border-l-4 border-secondary">
                  <p className="text-xs font-bold text-on-surface-variant uppercase mb-2 tracking-widest font-label">
                    Bank Mandiri
                  </p>
                  <p className="text-2xl font-black tracking-wider mb-1 font-headline text-primary">
                    1270 001 229 001
                  </p>
                  <p className="text-sm text-on-surface-variant font-body">
                    a.n. PT DeskWeave Teknologi
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-tertiary/10 rounded-lg text-tertiary-container text-sm flex gap-3 font-body">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  Penting: Mohon transfer <strong>tepat sesuai jumlah total</strong> untuk mempercepat proses verifikasi.
                </p>
              </div>
            </section>
          </div>

          {/* Right Column: Upload Form */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <section className="bg-surface-container-lowest rounded-xl p-6 shadow-xl border border-outline/10">
                <h2 className="text-xl font-bold font-headline mb-6">
                  Konfirmasi Pembayaran
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-on-surface-variant font-label">
                      Bukti Transfer (JPG/PNG)
                    </Label>
                    <div className="relative group">
                      <div className={`w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center bg-surface-container-low group-hover:bg-surface-container transition-colors cursor-pointer ${
                        selectedFile ? "border-secondary" : "border-outline/30"
                      }`}>
                        <UploadCloud className={`w-10 h-10 mb-2 transition-colors ${selectedFile ? "text-secondary" : "text-outline group-hover:text-primary"}`} />
                        <p className="text-xs text-on-surface-variant font-medium">
                          {selectedFile ? selectedFile.name : "Klik atau seret file ke sini"}
                        </p>
                      </div>
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        required
                        accept="image/*"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className="w-full py-6 gradient-primary text-white rounded-lg font-bold font-headline shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-base disabled:opacity-70"
                  >
                    {uploading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" /> Mengunggah...
                      </span>
                    ) : (
                      "Kirim Bukti Pembayaran"
                    )}
                  </Button>

                  <p className="text-[10px] text-center text-on-surface-variant uppercase tracking-widest mt-4">
                    Verifikasi membutuhkan waktu 10-30 menit pada jam operasional.
                  </p>
                </form>
              </section>

              <div className="mt-6 flex items-center justify-center gap-2 text-on-surface-variant transition-colors hover:text-primary">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-medium font-body">
                  Pembayaran Terenkripsi & Aman
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
