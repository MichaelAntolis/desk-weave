"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Eye, Loader2, ClipboardList, Filter } from "lucide-react";
import { DashboardHeader } from "@/components/custom/DashboardHeader";
import { formatRupiah, formatDate } from "@/lib/utils";
import { getOwnerPemesanan, verifyPemesanan } from "@/lib/actions/pemesanan";
import type { StatusPemesanan } from "@/lib/types/database";
import { OrderDetailDialog } from "./OrderDetailDialog";
import { Pagination } from "@/components/custom/Pagination";

type FilterStatus = StatusPemesanan | "ALL";

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof getOwnerPemesanan>>>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const data = await getOwnerPemesanan(filter === "ALL" ? undefined : filter);
    setOrders(data);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchOrders();
    setCurrentPage(1);
  }, [fetchOrders]);

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleVerify = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id);
    const result = await verifyPemesanan(id, action);
    if (result.error) {
      alert(result.error);
    }
    await fetchOrders();
    setActionLoading(null);
  };

  const handleShowDetail = (order: any) => {
    setSelectedOrder(order);
    setShowDetail(true);
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

  const FILTER_TABS: { label: string; value: FilterStatus }[] = [
    { label: "Semua", value: "ALL" },
    { label: "Menunggu", value: "MENUNGGU_VERIFIKASI" },
    { label: "Dikonfirmasi", value: "DIKONFIRMARI" as any }, // Fixed Typo
    { label: "Selesai", value: "SELESAI" },
    { label: "Ditolak", value: "DITOLAK" },
  ];

  // Correct the enum if needed
  const correctedTabs = FILTER_TABS.map(t => t.value === "DIKONFIRMARI" as any ? {...t, value: "DIKONFIRMASI"} : t);

  return (
    <div className="flex flex-col h-full bg-surface">
      <DashboardHeader 
        title="Kelola Pesanan" 
        role="OWNER" 
        subtitle="Orders" 
      />

      <section className="px-4 md:px-8 py-6 md:py-8 flex-1 space-y-6">
        {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-on-surface-variant shrink-0" />
        {correctedTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as FilterStatus)}
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
              filter === tab.value
                ? "bg-primary text-white"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          <div className="space-y-4">
            {paginatedOrders.map((order) => (
              <div key={order.id} className="bg-surface-container-lowest border border-outline/10 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                      {order.penyewa?.nama_lengkap?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-on-surface truncate">{order.penyewa?.nama_lengkap || "Penyewa"}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-on-surface-variant mt-0.5">
                        {order.ruangan?.nama || "Ruangan"} • Kode: <span className="font-mono font-bold text-primary">{order.kode_pemesanan}</span>
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {formatDate(order.tanggal_mulai)} — {formatDate(order.tanggal_selesai)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right mr-4">
                      <span className="text-lg font-bold text-primary font-headline">{formatRupiah(order.total_harga)}</span>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{formatDate(order.dibuat_pada)}</p>
                    </div>

                    <button
                      onClick={() => handleShowDetail(order)}
                      className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {order.status === "MENUNGGU_VERIFIKASI" && (
                      <>
                        <Button
                          onClick={() => handleVerify(order.id, "approve")}
                          disabled={actionLoading === order.id}
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg px-3 gap-1"
                        >
                          {actionLoading === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                          Setujui
                        </Button>
                        <Button
                          onClick={() => handleVerify(order.id, "reject")}
                          disabled={actionLoading === order.id}
                          size="sm"
                          variant="outline"
                          className="text-red-500 border-red-500/30 hover:bg-red-500/10 text-xs font-bold rounded-lg px-3 gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          Tolak
                        </Button>
                      </>
                    )}
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
          <ClipboardList className="w-16 h-16 text-outline mx-auto mb-4" />
          <h3 className="text-xl font-bold font-headline text-primary mb-2">Belum Ada Pesanan</h3>
          <p className="text-on-surface-variant text-sm">Pesanan dari penyewa akan muncul di sini.</p>
        </div>
      )}
      </section>

      {/* Order Detail Dialog */}
      <OrderDetailDialog 
        order={selectedOrder}
        open={showDetail}
        onOpenChange={setShowDetail}
      />
    </div>
  );
}
