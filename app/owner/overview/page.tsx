"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  ArrowUpRight, DollarSign, Calendar, Store, TrendingUp, Loader2, ClipboardList,
  Plus, Users, MessageSquare, Bell, ChevronRight, Zap, Target, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/custom/DashboardHeader";
import { formatRupiah, formatDate, cn } from "@/lib/utils";
import { getOwnerStats, getOwnerPemesanan } from "@/lib/actions/pemesanan";
import { useAuth } from "@/components/providers/AuthProvider";

export default function OwnerOverviewPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getOwnerStats>>>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [statsData, ordersData] = await Promise.all([
        getOwnerStats(),
        getOwnerPemesanan(),
      ]);
      setStats(statsData);
      setRecentOrders(ordersData.slice(0, 6));
      setLoading(false);
    }
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/10",
      MENUNGGU_VERIFIKASI: "bg-blue-500/10 text-blue-600 border-blue-500/10",
      DIKONFIRMASI: "bg-green-500/10 text-green-600 border-green-500/10",
      DITOLAK: "bg-red-500/10 text-red-600 border-red-500/10",
      DIBATALKAN: "bg-gray-500/10 text-gray-600 border-gray-500/10",
      SELESAI: "bg-violet-500/10 text-violet-600 border-violet-500/10",
    };
    const labels: Record<string, string> = {
      PENDING: "Pending",
      MENUNGGU_VERIFIKASI: "Verifikasi",
      DIKONFIRMASI: "Aktif",
      DITOLAK: "Ditolak",
      DIBATALKAN: "Batal",
      SELESAI: "Selesai",
    };
    return (
      <span className={cn("px-3 py-1 rounded-full border text-[9px] uppercase tracking-[0.1em] font-black", styles[status] || styles.PENDING)}>
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
    <div className="flex flex-col h-full bg-surface pb-20 md:pb-0 overflow-x-hidden">
      <DashboardHeader 
        title={`Halo, ${profile?.nama_lengkap?.split(" ")[0] || "Owner"} 👋`} 
        role="OWNER" 
        subtitle="Overview Hub" 
      />

      <section className="px-4 md:px-8 py-6 md:py-8 flex-1 space-y-12">
        {/* Row 1: Premium Stats Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Revenue", value: formatRupiah(stats?.totalRevenue || 0), icon: DollarSign, color: "green", bg: "bg-green-500/5", text: "text-green-600", trend: "+12%" },
            { label: "Bookings", value: stats?.totalBookings || 0, icon: Calendar, color: "blue", bg: "bg-blue-500/5", text: "text-blue-600", trend: "+5%" },
            { label: "Active Spaces", value: stats?.totalSpaces || 0, icon: Store, color: "amber", bg: "bg-amber-500/5", text: "text-amber-600", trend: "Stable" },
            { label: "Success Rate", value: `${stats?.occupancyRate || 0}%`, icon: TrendingUp, color: "violet", bg: "bg-violet-500/5", text: "text-violet-600", trend: "High" }
          ].map((card, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-[2rem] p-6 border border-outline/5 shadow-sm transition-all hover:shadow-xl hover:shadow-primary/5 group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 gradient-primary opacity-[0.02] -translate-y-1/2 translate-x-1/2 rounded-full" />
               <div className="flex items-center justify-between mb-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner", card.bg)}>
                    <card.icon className={cn("w-6 h-6", card.text)} />
                  </div>
                  <span className={cn("text-[10px] font-black uppercase tracking-widest bg-surface-container px-2 py-1 rounded-lg", card.text)}>{card.trend}</span>
               </div>
               <h3 className="text-3xl font-black text-on-surface font-headline tracking-tighter leading-none">{card.value}</h3>
               <p className="text-[10px] text-on-surface-variant mt-2 uppercase tracking-[0.2em] font-black opacity-40">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Row 2: Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* Recent Orders - The Big Card */}
           <div className="lg:col-span-8 bg-surface-container-lowest rounded-[2.5rem] border border-outline/10 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black font-headline text-on-surface tracking-tight uppercase tracking-wider leading-none">Pemesanan Terbaru</h2>
                    <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-40 mt-1">Audit transaksi periode berjalan</p>
                  </div>
                </div>
                <Link href="/owner/orders">
                  <Button variant="ghost" size="sm" className="text-[10px] font-black tracking-widest uppercase text-primary hover:bg-primary/5 rounded-xl px-5">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-surface-container-low/30 hover:bg-surface-container-low rounded-2xl transition-all group border border-transparent hover:border-outline/5 relative overflow-hidden">
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-primary font-black text-lg shadow-inner overflow-hidden border border-outline/10 group-hover:scale-105 transition-transform">
                          {order.penyewa?.avatar_url ? (
                             <img src={order.penyewa.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                             <span>{order.penyewa?.nama_lengkap?.charAt(0) || "U"}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-on-surface truncate text-md leading-tight">{order.penyewa?.nama_lengkap || "Penyewa"}</p>
                          <p className="text-[10px] text-on-surface-variant font-black opacity-40 uppercase tracking-widest mt-0.5">{order.ruangan?.nama || "Ruangan"}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2 relative z-10">
                        {getStatusBadge(order.status)}
                        <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-40 underline decoration-primary/20 decoration-2 underline-offset-4">{formatDate(order.dibuat_pada)}</span>
                      </div>
                      <div className="absolute inset-0 gradient-primary opacity-0 group-hover:opacity-[0.01] transition-opacity" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-surface-container-low/20 rounded-3xl border-2 border-dashed border-outline/10">
                  <p className="text-on-surface-variant font-black uppercase tracking-widest opacity-30 text-xs">Belum ada pesanan terbaru</p>
                </div>
              )}
           </div>

           {/* Quick Actions & Platform Insights */}
           <div className="lg:col-span-4 space-y-8">
              
              {/* Quick Actions Bento */}
              <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 border border-outline/10 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-2 gradient-primary" />
                 <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-8">Quick Launch</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <Link href="/owner/spaces">
                       <button className="w-full aspect-square bg-primary/5 hover:bg-primary text-primary hover:text-white rounded-3xl transition-all flex flex-col items-center justify-center gap-3 group border border-primary/5">
                          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                          <span className="text-[10px] font-black uppercase tracking-widest">New Space</span>
                       </button>
                    </Link>
                    <Link href="/owner/messages">
                       <button className="w-full aspect-square bg-blue-500/5 hover:bg-blue-500 text-blue-500 hover:text-white rounded-3xl transition-all flex flex-col items-center justify-center gap-3 group border border-blue-500/5">
                          <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Messages</span>
                       </button>
                    </Link>
                 </div>
              </div>

              {/* Platform Status */}
              <div className="bg-surface-container-high rounded-[2.5rem] p-8 text-on-surface shadow-xl relative overflow-hidden border-t border-white/20">
                 <div className="absolute top-0 right-0 w-32 h-32 gradient-primary opacity-[0.2] -translate-y-1/2 translate-x-1/2 rounded-full blur-2xl" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-6 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Platform Insight
                 </h3>
                 <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Target className="w-5 h-5 text-on-surface" /></div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Goal Progress</p>
                          <p className="text-lg font-black leading-none">82% <span className="text-[10px] opacity-40">OF TARGET</span></p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Star className="w-5 h-5 text-on-surface" /></div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg Rating</p>
                          <p className="text-lg font-black leading-none">4.92 <span className="text-[10px] opacity-40">EXCELLENT</span></p>
                       </div>
                    </div>
                    <div className="p-4 bg-primary/10 rounded-2xl border-l-[3px] border-primary mt-4">
                       <p className="text-[10px] font-bold opacity-80 leading-relaxed italic">
                          "Minggu ini, reservasi Anda meningkat 15% di sektor Hot Desk."
                       </p>
                    </div>
                 </div>
              </div>
           </div>

        </div>
      </section>
    </div>
  );
}
