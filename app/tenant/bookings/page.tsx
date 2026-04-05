"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, Loader2, Building, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatDate } from "@/lib/utils";
import { getTenantPemesanan, cancelPemesanan } from "@/lib/actions/pemesanan";
import Link from "next/link";
import { DashboardHeader } from "@/components/custom/DashboardHeader";
import { Pagination } from "@/components/custom/Pagination";

export default function TenantBookingsPage() {
  const [bookings, setBookings] = useState<Awaited<ReturnType<typeof getTenantPemesanan>>>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchBookings = async () => {
    setLoading(true);
    const data = await getTenantPemesanan();
    setBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const paginatedBookings = bookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCancel = async (id: string) => {
    if (!confirm("Yakin ingin membatalkan pemesanan ini?")) return;
    setActionLoading(id);
    const result = await cancelPemesanan(id);
    if (result.error) {
      alert(result.error);
    }
    await fetchBookings();
    setActionLoading(null);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      MENUNGGU_VERIFIKASI: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      DIKONFIRMASI: "bg-green-500/10 text-green-600 border-green-500/20",
      DITOLAK: "bg-red-500/10 text-red-600 border-red-500/20",
      DIBATALKAN: "bg-gray-400/10 text-gray-500 border-gray-400/20",
      SELESAI: "bg-violet-500/10 text-violet-600 border-violet-500/20",
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
      <span className={`px-2.5 py-1 rounded-lg border text-[10px] uppercase tracking-wider font-bold ${styles[status] || styles.PENDING}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      <DashboardHeader 
        title="Pemesanan Saya" 
        role="TENANT" 
        subtitle="Bookings" 
        rightActions={
          <Link href="/explore">
            <Button size="sm" className="gradient-primary text-white text-xs font-bold rounded-xl px-4 shadow-lg shadow-primary/20 hover:scale-[1.05] transition-transform">
              Booking Tempat Baru
            </Button>
          </Link>
        }
      />

      <section className="px-4 md:px-8 py-6 md:py-8 flex-1 space-y-8">
        {/* Bookings List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-6">
          <div className="space-y-4">
            {paginatedBookings.map((booking) => (
              <div key={booking.id} className="bg-surface-container-lowest border border-outline/10 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="w-full md:w-48 h-32 md:h-auto bg-surface-container shrink-0 overflow-hidden">
                    {booking.ruangan?.foto_utama ? (
                      <img src={booking.ruangan.foto_utama} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <Building className="w-8 h-8 text-primary" />
                      </div>
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex-1 p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-lg font-headline text-on-surface truncate">{booking.ruangan?.nama || "Ruangan"}</h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        <p className="text-sm text-on-surface-variant mb-1">
                          {booking.ruangan?.lokasi}{booking.ruangan?.kota ? `, ${booking.ruangan.kota}` : ""}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          Kode: <span className="font-mono font-bold text-primary">{booking.kode_pemesanan}</span> • {formatDate(booking.tanggal_mulai)} — {formatDate(booking.tanggal_selesai)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right mr-2">
                          <span className="text-lg font-bold text-primary font-headline">{formatRupiah(booking.total_harga)}</span>
                        </div>
                        {booking.status === "PENDING" && (
                          <Link href={`/checkout?id=${booking.id}`}>
                            <Button size="sm" className="gradient-primary text-white text-xs font-bold rounded-lg px-4 gap-1">
                              Bayar
                            </Button>
                          </Link>
                        )}
                        {booking.ruangan?.id && (
                          <Link href={`/space/${booking.ruangan.id}`}>
                            <Button size="sm" variant="outline" className="text-xs font-bold rounded-lg px-3 gap-1">
                              <Eye className="w-3 h-3" /> Detail
                            </Button>
                          </Link>
                        )}
                        {["PENDING", "DITOLAK"].includes(booking.status) && (
                          <Button
                            onClick={() => handleCancel(booking.id)}
                            disabled={actionLoading === booking.id}
                            size="sm"
                            variant="outline"
                            className="text-red-500 border-red-500/30 hover:bg-red-500/10 text-xs font-bold rounded-lg px-3 gap-1"
                          >
                            {actionLoading === booking.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                            Batal
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : (
        <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-outline/10">
          <CalendarCheck className="w-16 h-16 text-outline mx-auto mb-4" />
          <h3 className="text-xl font-bold font-headline text-primary mb-2">Belum Ada Pemesanan</h3>
          <p className="text-on-surface-variant text-sm mb-6">Temukan ruang kerja sempurna dan buat pemesanan pertama Anda.</p>
          <Link href="/explore">
            <Button className="gradient-primary font-bold">Cari Ruang Kerja</Button>
          </Link>
        </div>
      )}
      </section>
    </div>
  );
}
