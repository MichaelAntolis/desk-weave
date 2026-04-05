"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, Search, Loader2, ArrowRight, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/custom/NotificationBell";
import { ProfileMenu } from "@/components/custom/ProfileMenu";
import { CalendarWidget } from "@/components/custom/CalendarWidget";
import { formatRupiah, formatDate } from "@/lib/utils";
import { getTenantPemesanan } from "@/lib/actions/pemesanan";
import { useAuth } from "@/components/providers/AuthProvider";

import { DashboardHeader } from "@/components/custom/DashboardHeader";

export default function TenantDashboard() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Awaited<ReturnType<typeof getTenantPemesanan>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await getTenantPemesanan();
      setBookings(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const activeBookings = bookings.filter((b) => ["DIKONFIRMASI", "MENUNGGU_VERIFIKASI", "PENDING"].includes(b.status));
  const recentBookings = bookings.slice(0, 3);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-amber-500/10 text-amber-600",
      MENUNGGU_VERIFIKASI: "bg-blue-500/10 text-blue-600",
      DIKONFIRMASI: "bg-green-500/10 text-green-600",
      DITOLAK: "bg-red-500/10 text-red-600",
      DIBATALKAN: "bg-gray-400/10 text-gray-500",
      SELESAI: "bg-violet-500/10 text-violet-600",
    };
    const labels: Record<string, string> = {
      PENDING: "Pending",
      MENUNGGU_VERIFIKASI: "Menunggu Verifikasi",
      DIKONFIRMASI: "Dikonfirmasi",
      DITOLAK: "Ditolak",
      DIBATALKAN: "Dibatalkan",
      SELESAI: "Selesai",
    };
    return (
      <span className={`px-2 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${styles[status] || styles.PENDING}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 h-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface">
      <DashboardHeader 
        title={`Selamat datang, ${profile?.nama_lengkap?.split(" ")[0] || "Tenant"} 👋`} 
        role="TENANT" 
        subtitle="Dashboard" 
        rightActions={
          <Link href="/explore">
            <Button size="sm" className="gradient-primary text-white text-xs font-bold rounded-xl px-4 shadow-lg shadow-primary/20 hover:scale-[1.05] transition-transform">
              Booking Tempat Baru
            </Button>
          </Link>
        }
      />

      <section className="px-4 md:px-8 py-6 md:py-8 flex-1 space-y-8">
        {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/explore" className="bg-primary text-white rounded-xl p-6 hover:bg-primary/90 transition-colors group">
          <Search className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold font-headline text-lg mb-1">Cari Ruang Kerja</h3>
          <p className="text-sm text-white/70">Temukan tempat kerja ideal Anda.</p>
        </Link>
        <Link href="/tenant/bookings" className="bg-surface-container-lowest border border-outline/10 rounded-xl p-6 hover:shadow-lg transition-all group">
          <CalendarCheck className="w-8 h-8 mb-3 text-secondary group-hover:scale-110 transition-transform" />
          <h3 className="font-bold font-headline text-lg mb-1 text-on-surface">Pemesanan Saya</h3>
          <p className="text-sm text-on-surface-variant">{activeBookings.length} pemesanan aktif</p>
        </Link>
        <div className="bg-surface-container-lowest border border-outline/10 rounded-xl p-6">
          <Building className="w-8 h-8 mb-3 text-amber-500" />
          <h3 className="font-bold font-headline text-lg mb-1 text-on-surface">Total Pemesanan</h3>
          <p className="text-2xl font-black text-primary">{bookings.length}</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold font-headline flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-primary" />
              Pemesanan Terbaru
            </h2>
            <Link href="/tenant/bookings">
              <Button variant="ghost" size="sm" className="text-xs font-bold text-primary gap-1">
                Lihat Semua <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>

          {recentBookings.length > 0 ? (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-surface-container overflow-hidden shrink-0">
                      {booking.ruangan?.foto_utama ? (
                        <img src={booking.ruangan.foto_utama} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <Building className="w-5 h-5 text-primary" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface">{booking.ruangan?.nama || "Ruangan"}</p>
                      <p className="text-xs text-on-surface-variant">{formatDate(booking.tanggal_mulai)} — {formatDate(booking.tanggal_selesai)}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    {getStatusBadge(booking.status)}
                    <span className="text-sm font-bold text-primary">{formatRupiah(booking.total_harga)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-on-surface-variant text-sm mb-4">Belum ada pemesanan</p>
              <Link href="/explore">
                <Button className="gradient-primary font-bold">Cari Ruang Kerja</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Calendar Widget */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline/10 p-6">
          <CalendarWidget />
        </div>
      </div>
      </section>
    </div>
  );
}
