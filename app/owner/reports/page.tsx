"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  DollarSign, TrendingUp, BarChart3, CheckCircle, Loader2, 
  FileText, Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, ChevronDown, Filter,
  LayoutGrid, Users, Trophy, Zap, ArrowRight, Wallet, PieChart
} from "lucide-react";
import { formatRupiah, formatDate, cn } from "@/lib/utils";
import { getOwnerStats, getOwnerConfirmedTransactions } from "@/lib/actions/pemesanan";
import { DashboardHeader } from "@/components/custom/DashboardHeader";
import { ReportChart } from "./ReportChart";
import { Pagination } from "@/components/custom/Pagination";
import { Button } from "@/components/ui/button";

export default function OwnerReportsPage() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getOwnerStats>>>(null);
  const [transactions, setTransactions] = useState<Awaited<ReturnType<typeof getOwnerConfirmedTransactions>>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"7days" | "30days" | "all" | "custom">("7days");
  
  // Custom Date Range
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState<"start" | "end" | null>(null);
  const [pickerDate, setPickerDate] = useState(new Date());

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [statsData, trxData] = await Promise.all([
        getOwnerStats(),
        getOwnerConfirmedTransactions(),
      ]);
      setStats(statsData);
      setTransactions(trxData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      const trxDate = new Date(t.diverifikasi_pada || t.dibuat_pada);
      if (filter === "7days") return (now.getTime() - trxDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
      if (filter === "30days") return (now.getTime() - trxDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
      if (filter === "custom" && startDate && endDate) {
        const s = new Date(startDate);
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        return trxDate >= s && trxDate <= e;
      }
      return true;
    }).sort((a, b) => new Date(b.diverifikasi_pada || b.dibuat_pada).getTime() - new Date(a.diverifikasi_pada || a.dibuat_pada).getTime());
  }, [transactions, filter, startDate, endDate]);

  const totalRevenue = useMemo(() => {
    return filteredTransactions.reduce((sum, trx) => sum + trx.total_harga, 0);
  }, [filteredTransactions]);

  // --- Insight Analytics ---
  const topSpaces = useMemo(() => {
    const spaceMap: Record<string, { id: string; name: string; revenue: number; count: number }> = {};
    filteredTransactions.forEach(t => {
      const id = t.ruangan_id;
      const name = t.ruangan?.nama || "Unknown";
      if (!spaceMap[id]) spaceMap[id] = { id, name, revenue: 0, count: 0 };
      spaceMap[id].revenue += t.total_harga;
      spaceMap[id].count += 1;
    });
    return Object.values(spaceMap).sort((a, b) => b.revenue - a.revenue).slice(0, 4);
  }, [filteredTransactions]);

  const revenueByDay = useMemo(() => {
    const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const dayMap: Record<string, number> = { "0":0, "1":0, "2":0, "3":0, "4":0, "5":0, "6":0 };
    filteredTransactions.forEach(t => {
      const d = new Date(t.diverifikasi_pada || t.dibuat_pada).getDay();
      dayMap[d] += t.total_harga;
    });
    const maxVal = Math.max(...Object.values(dayMap), 1);
    return Object.entries(dayMap).map(([day, val]) => ({
      name: days[parseInt(day)],
      val,
      percentage: Math.round((val / maxVal) * 100)
    }));
  }, [filteredTransactions]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDateToISO = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const renderCalendar = () => {
    const year = pickerDate.getFullYear();
    const month = pickerDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();
    const monthName = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(pickerDate);

    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

    return (
      <div className="bg-white rounded-[2.5rem] p-6 shadow-3xl border border-outline/10 animate-in zoom-in-95 duration-300 w-[320px]">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-black text-xs text-primary uppercase tracking-[0.2em]">{monthName}</h4>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPickerDate(new Date(year, month - 1, 1))} className="h-9 w-9 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-primary/10 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button type="button" onClick={() => setPickerDate(new Date(year, month + 1, 1))} className="h-9 w-9 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-primary/10 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5 mb-4">
          {["S", "S", "R", "K", "J", "S", "M"].map((d, i) => (
            <div key={`${d}-${i}`} className="text-[10px] font-black text-outline/40 text-center py-1">{d}</div>
          ))}
          {days.map((date, idx) => {
            if (!date) return <div key={idx} />;
            const dStr = formatDateToISO(date);
            const isSelected = showDatePicker === "start" ? startDate === dStr : endDate === dStr;
            const isRange = startDate && endDate && dStr > startDate && dStr < endDate;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (showDatePicker === "start") {
                    setStartDate(dStr);
                    setShowDatePicker("end");
                  } else {
                    if (dStr < startDate) {
                        setStartDate(dStr);
                        setShowDatePicker("end");
                    } else {
                        setEndDate(dStr);
                        setShowDatePicker(null);
                    }
                  }
                }}
                className={cn(
                  "aspect-square rounded-2xl text-xs font-bold transition-all relative flex items-center justify-center",
                  "hover:bg-primary/10 text-on-surface",
                  isSelected ? "bg-primary text-white shadow-xl shadow-primary/30 scale-105 z-10" : "",
                  isRange ? "bg-primary/5 text-primary" : ""
                )}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
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
    <div className="flex flex-col h-full bg-surface pb-20 md:pb-0 font-body overflow-x-hidden">
      <DashboardHeader 
        title="Laporan & Analitik" 
        role="OWNER" 
        subtitle="Financial Dashboard" 
      />

      <section className="px-4 md:px-8 py-6 md:py-8 flex-1 space-y-12">
        {/* Row 1: Main Stats Grid (Standard Dashboard) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Pendapatan", value: formatRupiah(stats?.totalRevenue || 0), icon: DollarSign, color: "green", bg: "bg-green-500/10", text: "text-green-600" },
            { label: "Total Pemesanan", value: stats?.totalBookings || 0, icon: BarChart3, color: "blue", bg: "bg-blue-500/10", text: "text-blue-600" },
            { label: "Terkonfirmasi", value: stats?.confirmedCount || 0, icon: CheckCircle, color: "violet", bg: "bg-violet-500/10", text: "text-violet-600" },
            { label: "Success Rate", value: `${stats?.occupancyRate || 0}%`, icon: TrendingUp, color: "amber", bg: "bg-amber-500/10", text: "text-amber-600" }
          ].map((card, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-3xl p-6 border border-outline/10 shadow-sm transition-all hover:shadow-xl hover:shadow-primary/5 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 gradient-primary opacity-[0.03] -translate-y-1/2 translate-x-1/2 rounded-full group-hover:scale-150 transition-transform duration-1000" />
              <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center mb-5 ring-8 ring-transparent group-hover:ring-on-surface/5 transition-all`}>
                <card.icon className={`w-6 h-6 ${card.text}`} />
              </div>
              <h3 className="text-3xl font-black text-on-surface font-headline tracking-tighter leading-none">{card.value}</h3>
              <p className="text-[10px] text-on-surface-variant mt-3 uppercase tracking-[0.2em] font-black opacity-60">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Row 2: Dynamic Chart (The Hero Section) */}
        <div className="bg-surface-container-lowest rounded-[3rem] p-6 md:p-10 shadow-3xl shadow-primary/[0.04] transition-all hover:shadow-primary/[0.08] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 gradient-primary opacity-[0.02] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
          
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 mb-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[1.8rem] gradient-primary flex items-center justify-center text-white shadow-2xl shadow-primary/30 relative overflow-hidden active:scale-95 transition-transform">
                <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black font-headline text-on-surface tracking-tighter leading-none">Analitik Dinamis</h2>
                <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.3em] opacity-40">Pantau performa unit dalam satu dashboard.</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-5 p-2 bg-surface-container-low/50 rounded-[2rem] border border-outline/5 relative">
              <div className="flex p-1.5 bg-white shadow-inner rounded-[1.5rem]">
                {(["7days", "30days", "all", "custom"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                        setFilter(opt);
                        if (opt !== "custom") setShowDatePicker(null);
                        else if (!startDate) setShowDatePicker("start");
                    }}
                    className={cn(
                        "px-6 py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-[0.2em]",
                        filter === opt
                          ? "bg-primary text-white shadow-xl scale-[1.05] z-10"
                          : "text-on-surface-variant hover:text-primary opacity-60 hover:opacity-100"
                    )}
                  >
                    {opt === "7days" ? "7D" : opt === "30days" ? "30D" : opt === "all" ? "All" : "Custom"}
                  </button>
                ))}
              </div>

              {filter === "custom" && (
                <div className="flex items-center gap-2 group relative">
                  <button 
                      onClick={() => setShowDatePicker("start")}
                      className="flex items-center gap-3 bg-primary/5 px-6 py-3 rounded-2xl border border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary/10 transition-all group/date"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    {startDate ? `${formatDate(startDate)} — ${endDate ? formatDate(endDate) : '...'}` : "Pilih Rentang"}
                    <ChevronDown className="w-4 h-4 opacity-30 group-hover/date:translate-y-0.5 transition-transform" />
                  </button>
                  
                  {showDatePicker && (
                    <div className="absolute top-full right-0 mt-4 z-[100] animate-in slide-in-from-top-4 duration-300">
                        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden" onClick={() => setShowDatePicker(null)} />
                        <div className="relative">
                            {renderCalendar()}
                            <button onClick={() => setShowDatePicker(null)} className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white shadow-2xl flex items-center justify-center text-outline hover:text-primary transition-transform hover:rotate-90">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <ReportChart transactions={transactions} filter={filter} startDate={startDate} endDate={endDate} />
        </div>

        {/* Row 3: Bento Grid Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
           
           {/* Top Performing Spaces (Large Vertical Bento) */}
           <div className="lg:col-span-4 lg:row-span-2 bg-surface-container-lowest rounded-[2.5rem] p-8 border border-outline/10 shadow-sm flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-inner">
                    <Trophy className="w-5 h-5" />
                 </div>
                 <div>
                    <h3 className="text-md font-black font-headline text-on-surface tracking-tight uppercase tracking-widest leading-none">Top Performance</h3>
                    <p className="text-[9px] text-on-surface-variant font-black uppercase tracking-[0.2em] opacity-40 mt-1">Ruangan Paling Produktif</p>
                 </div>
              </div>

              <div className="space-y-2 flex-1">
                 {topSpaces.length > 0 ? topSpaces.map((space, i) => (
                   <div key={space.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-surface-container-low transition-all border border-transparent hover:border-outline/5 group relative overflow-hidden">
                      <div className="flex items-center gap-4 relative z-10">
                         <span className="text-lg font-black text-on-surface-variant/20 italic group-hover:text-primary/10 transition-colors">#{i+1}</span>
                         <div className="min-w-0">
                            <p className="font-black text-on-surface truncate tracking-tight text-sm leading-tight">{space.name}</p>
                            <p className="text-[9px] text-on-surface-variant font-black opacity-40 uppercase tracking-widest">{space.count} Pesanan</p>
                         </div>
                      </div>
                      <div className="text-right relative z-10">
                         <p className="font-black text-primary font-headline tracking-tighter text-sm">{formatRupiah(space.revenue).split(',')[0].replace("Rp ", "")}</p>
                      </div>
                      <div className="absolute inset-0 gradient-primary opacity-0 group-hover:opacity-[0.02] transition-opacity" />
                   </div>
                 )) : (
                   <p className="text-center py-10 text-[10px] font-black uppercase tracking-[0.2em] text-outline/30">Data Kosong</p>
                 )}
              </div>
              
              <Button variant="ghost" className="w-full mt-6 py-5 rounded-2xl text-[9px] font-black uppercase tracking-[0.4em] text-on-surface-variant/60 hover:text-primary border border-transparent hover:border-primary/10 hover:bg-primary/5 group">
                 See All Report <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
           </div>

           {/* Analysis Highlights (Medium Bento) */}
           <div className="lg:col-span-5 bg-surface-container-high rounded-[2.5rem] p-8 text-on-surface relative overflow-hidden shadow-xl border-t border-white/20">
              <div className="absolute top-0 right-0 w-64 h-64 gradient-primary opacity-[0.1] -translate-y-1/2 translate-x-1/2 rounded-full blur-3xl" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                 <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-6 flex items-center gap-3">
                        <Wallet className="w-4 h-4" /> Financial Matrix
                    </h3>
                    
                    <div className="flex items-baseline gap-2 mb-4">
                       <h4 className="text-4xl font-black font-headline tracking-tighter">{formatRupiah(totalRevenue).split(',')[0]}</h4>
                       <span className="text-[10px] font-blue text-primary font-black opacity-60">NET REVENUE</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/40 rounded-2xl backdrop-blur-sm">
                       <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Avg Order</p>
                       <p className="text-md font-black">{formatRupiah(filteredTransactions.length > 0 ? (totalRevenue / filteredTransactions.length) : 0).split(',')[0]}</p>
                    </div>
                    <div className="p-4 bg-white/40 rounded-2xl backdrop-blur-sm">
                       <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Total Unit</p>
                       <p className="text-md font-black">{topSpaces.length}</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Smart Insights (Medium Bento) */}
           <div className="lg:col-span-3 bg-surface-container-lowest rounded-[2.5rem] p-7 border border-outline/10 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-4">
                 <PieChart className="w-5 h-5 text-primary" />
                 <h3 className="text-xs font-black font-headline text-on-surface tracking-tight uppercase tracking-widest leading-none">Smart Insight</h3>
              </div>
              <div className="space-y-3">
                 <div className="p-4 bg-primary/5 rounded-2xl border-l-[3px] border-primary">
                    <p className="text-[10px] font-bold text-on-surface-variant leading-relaxed">
                       Unit <span className="font-black text-primary">Private Office</span> menyumbang 65% pendapatan.
                    </p>
                 </div>
                 <div className="p-4 bg-green-500/5 rounded-2xl border-l-[3px] border-green-500">
                    <p className="text-[10px] font-bold text-on-surface-variant leading-relaxed">
                       Tren reservasi meningkat di hari <span className="font-black text-green-600">Jumat</span>.
                    </p>
                 </div>
              </div>
           </div>

           {/* Daily Traffic Analysis (Wide Horizontal Bento) */}
           <div className="lg:col-span-8 bg-surface-container-lowest rounded-[2.5rem] p-8 border border-outline/10 shadow-sm relative overflow-hidden flex items-center justify-between gap-10">
              <div className="shrink-0 w-44">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                       <Zap className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black font-headline text-on-surface tracking-tight uppercase tracking-widest">Traffic</h3>
                 </div>
                 <p className="text-[10px] text-on-surface-variant font-bold leading-relaxed opacity-60">Analisis distribusi okupansi dan pendapatan per hari dalam periode terpilih.</p>
              </div>

              <div className="flex-1 flex items-end justify-between gap-2 h-24">
                 {revenueByDay.map((day) => (
                   <div key={day.name} className="flex-1 flex flex-col items-center group max-w-[40px]">
                      <div className="w-full bg-primary/5 rounded-full relative flex items-end h-full mb-2 overflow-hidden group-hover:bg-primary/10 transition-colors">
                         <div 
                           className="w-full gradient-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--color-primary),0.3)]" 
                           style={{ height: `${day.percentage}%` }}
                         />
                      </div>
                      <span className={cn("text-[9px] font-black uppercase transition-colors whitespace-nowrap", day.percentage > 70 ? "text-primary" : "text-outline/40")}>{day.name}</span>
                   </div>
                 ))}
              </div>
           </div>

        </div>

        {/* Transaction History (Activity Log Section) */}
        <div className="space-y-8 pt-12 pb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-outline/10 pb-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary shadow-inner">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black font-headline text-on-surface tracking-tighter uppercase tracking-[0.05em]">Log Aktivitas Keuangan</h2>
                <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.3em] opacity-40 leading-none mt-1">Audit transaksi terverifikasi secara sistem.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-surface-container-low px-5 py-2.5 rounded-2xl border border-outline/5 shadow-sm">
                <Filter className="w-4 h-4 text-outline" />
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{filteredTransactions.length} Log Item Audit</span>
            </div>
          </div>

          {filteredTransactions.length > 0 ? (
            <div className="space-y-4">
              <div className="hidden lg:grid grid-cols-12 gap-4 px-8 text-[11px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 pb-4">
                <div className="col-span-4">Informasi Transaksi</div>
                <div className="col-span-3">Tanggal Verifikasi</div>
                <div className="col-span-3 text-right">Nominal Dana</div>
                <div className="col-span-2 text-center">Status</div>
              </div>

              <div className="space-y-4">
                {paginatedTransactions.map((trx) => (
                  <div key={trx.id} className="bg-surface-container-lowest border border-outline/5 rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-primary/[0.04] transition-all group relative overflow-hidden hover:-translate-y-1">
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.01] transition-colors" />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
                      <div className="lg:col-span-4 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-[1.4rem] bg-surface-container-low flex items-center justify-center text-primary text-xl font-black group-hover:bg-primary group-hover:text-white transition-all shadow-inner overflow-hidden border border-outline/5">
                          {trx.penyewa?.avatar_url ? (
                            <img 
                              src={trx.penyewa.avatar_url} 
                              alt={trx.penyewa.nama_lengkap || "User"} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-xl font-black">${trx.penyewa?.nama_lengkap?.charAt(0) || "U"}</span>`;
                              }}
                            />
                          ) : (
                            <span>{trx.penyewa?.nama_lengkap?.charAt(0) || "U"}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-on-surface truncate tracking-tight text-lg leading-tight">{trx.penyewa?.nama_lengkap || "Penyewa"}</p>
                          <p className="text-[10px] text-on-surface-variant font-bold opacity-40 truncate uppercase tracking-widest">{trx.ruangan?.nama || "Ruangan"}</p>
                        </div>
                      </div>
                      
                      <div className="lg:col-span-3">
                        <p className="text-sm font-black text-on-surface-variant/80 uppercase tracking-tighter">
                          {formatDate(trx.diverifikasi_pada || trx.dibuat_pada)}
                        </p>
                      </div>

                      <div className="lg:col-span-3 text-left lg:text-right">
                        <p className="text-2xl font-black text-primary font-headline tracking-tighter leading-none">{formatRupiah(trx.total_harga).split(',')[0]}</p>
                      </div>

                      <div className="lg:col-span-2 flex justify-start lg:justify-center">
                        <span className="px-5 py-2.5 rounded-[1.2rem] bg-green-500/10 text-green-600 text-[10px] uppercase tracking-[0.2em] font-black border border-green-500/10 shadow-sm flex items-center gap-2 group-hover:bg-green-500 group-hover:text-white transition-all">
                          <CheckCircle className="w-3.5 h-3.5" />
                          VERIFIED
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-12 pb-24">
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
              </div>
            </div>
          ) : (
            <div className="text-center py-32 bg-surface-container-low/30 rounded-[3rem] border-4 border-dashed border-outline/10">
              <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-8 text-outline/20">
                <FileText className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black font-headline text-primary uppercase tracking-[0.2em] mb-3">No Matrix Data</h3>
              <p className="text-on-surface-variant text-sm font-black uppercase tracking-widest opacity-30">Audit log is currently empty for the selected period.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
