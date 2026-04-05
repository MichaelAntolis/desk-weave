"use client";

import { formatRupiah, cn } from "@/lib/utils";
import { useMemo, useState } from "react";

interface Transaction {
  id: string;
  total_harga: number;
  diverifikasi_pada: string;
  dibuat_pada: string;
}

interface ReportChartProps {
  transactions: Transaction[];
  filter: "7days" | "30days" | "all" | "custom";
  startDate?: string;
  endDate?: string;
}

export function ReportChart({ transactions, filter, startDate, endDate }: ReportChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const filteredTrx = useMemo(() => {
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
    }).sort((a, b) => new Date(a.diverifikasi_pada || a.dibuat_pada).getTime() - new Date(b.diverifikasi_pada || b.dibuat_pada).getTime());
  }, [transactions, filter, startDate, endDate]);

  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredTrx.forEach(t => {
       const d = new Date(t.diverifikasi_pada || t.dibuat_pada);
       const key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
       grouped[key] = (grouped[key] || 0) + t.total_harga;
    });
    
    let result = Object.entries(grouped).map(([name, value]) => ({ name, value }));
    
    // Fallback if data is too sparse
    if (result.length === 1) {
       result = [{ name: "", value: result[0].value * 0.5 }, ...result];
    } else if (result.length === 0) {
       return [];
    }
    return result;
  }, [filteredTrx]);

  const maxVal = useMemo(() => {
    const highest = Math.max(...chartData.map(d => d.value), 100000);
    return highest * 1.2; // Padding
  }, [chartData]);

  const totalRevenue = chartData.reduce((acc, curr) => acc + curr.value, 0);

  // Helper: Abbreviated Rupiah Logic
  const formatShortVal = (val: number) => {
    if (val >= 1000000) {
      return (val / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + "jt";
    }
    if (val >= 1000) {
      return (val / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + "rb";
    }
    return val.toString();
  };

  // SVG Calculation Helpers
  const chartWidth = 1000;
  const chartHeight = 400;

  const getCoordinates = (index: number, value: number) => ({
    x: (index / (chartData.length - 1 || 1)) * chartWidth,
    y: chartHeight - (value / maxVal) * chartHeight,
  });

  const getPathData = (data: { value: number }[]) => {
    if (data.length < 2) return "";
    const pts = data.map((d, i) => getCoordinates(i, d.value));
    return pts.reduce((path, point, i, ptsArr) => {
      if (i === 0) return `M ${point.x},${point.y}`;
      const prev = ptsArr[i - 1];
      const cx1 = prev.x + (point.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (point.x - prev.x) / 2;
      const cy2 = point.y;
      return `${path} C ${cx1},${cy1} ${cx2},${cy2} ${point.x},${point.y}`;
    }, "");
  };

  if (chartData.length === 0) {
    return (
      <div className="w-full aspect-[2/1] flex flex-col items-center justify-center bg-surface-container-low/20 rounded-3xl border-4 border-dashed border-outline/10 p-10 mt-6 md:min-h-[300px]">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <svg className="w-10 h-10 text-primary opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20" /></svg>
        </div>
        <h3 className="text-xl font-black font-headline text-primary opacity-50 uppercase tracking-widest">Belum Ada Data</h3>
        <p className="text-xs text-on-surface-variant font-bold opacity-30 mt-2">Transaksi yang terverifikasi akan tampil di sini.</p>
      </div>
    );
  }

  // Improved Label Skip Logic for all devices
  const labelSkipCount = useMemo(() => {
    if (chartData.length < 5) return 0;
    if (chartData.length < 10) return 1;
    if (chartData.length < 20) return 3;
    return Math.floor(chartData.length / 5);
  }, [chartData]);

  return (
    <div className="w-full flex-1 flex flex-col pt-6 animate-in fade-in zoom-in-95 duration-1000">
      {/* Metrics Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between px-2 mb-10 gap-6">
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-40">Pendapatan Keseluruhan</p>
          <div className="flex items-center gap-4">
            <h2 className="text-2xl lg:text-3xl font-black font-headline text-on-surface tracking-tighter shadow-on-surface/5">{formatRupiah(totalRevenue)}</h2>
            <div className="flex items-center gap-1.5 text-green-500 bg-green-500/10 px-2 py-0.5 rounded-[10px] text-[10px] font-black shadow-inner shadow-green-500/10">
               <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
               13.02%
            </div>
          </div>
        </div>
      </div>

      {/* Main SVG Chart Container */}
      <div className="relative w-full aspect-[1.5/1] md:aspect-[3.6/1]">
        {/* Horizontal Grid lines & Y-Axis Labels (Min and Max Only) */}
        <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between pointer-events-none pb-12 pr-6 md:pr-14 pl-2 md:pl-10">
           {[1, 0].map((ratio) => (
             <div key={ratio} className="flex items-center gap-4 md:gap-4 w-full">
                <span className="text-[7px] md:text-[8px] font-bold md:font-black text-on-surface-variant/40 uppercase tracking-[0.1em] md:tracking-[0.2em] w-8 md:w-10 shrink-0 text-right opacity-60">
                    {formatShortVal(maxVal * ratio)}
                </span>
                <div className={cn("flex-1 h-[1px]", ratio === 0 ? "bg-outline/20" : "bg-outline/5")} />
             </div>
           ))}
        </div>

        {/* SVG Drawing Layer - Perfectly Balanced Padding */}
        <div className="absolute inset-0 pl-14 md:pl-28 pr-6 md:pr-14 pb-12">
            <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                className="w-full h-full overflow-visible drop-shadow-2xl" 
                preserveAspectRatio="none"
            >
                {/* Fill Area Gradient */}
                <path 
                   d={`${getPathData(chartData)} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`}
                   fill="url(#smoothGradient)"
                   className="opacity-10 pointer-events-none font-black"
                />

                <defs>
                   <linearGradient id="smoothGradient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="var(--color-primary)" />
                     <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                   </linearGradient>
                </defs>

                {/* Main Blue Line Curve */}
                <path 
                   d={getPathData(chartData)} 
                   fill="none" 
                   stroke="currentColor" 
                   strokeWidth="5" 
                   strokeLinecap="round" 
                   strokeLinejoin="round"
                   className="text-primary transition-all duration-1000" 
                />

                {/* Active Tooltip and Focus Points */}
                {chartData.map((d, i) => {
                   const { x, y } = getCoordinates(i, d.value);
                   const isHovered = hoveredPoint === i;
                   return (
                     <g key={i} onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)}>
                        {/* Hidden larger hit area for mouse */}
                        <circle cx={x} cy={y} r="25" fill="transparent" className="cursor-pointer" />
                        
                        {/* Point Circle */}
                        <circle cx={x} cy={y} r="6" className={cn("fill-white stroke-primary stroke-[4px] shadow-2xl transition-all duration-300", isHovered ? "r-8 shadow-primary/40" : "r-6")} />
                        
                        {/* Tooltip Overlay */}
                        <foreignObject 
                            x={x - 60} y={y - 80} width="120" height="60" 
                            className={cn("overflow-visible pointer-events-none transition-all duration-500", isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}
                        >
                            <div className="bg-primary text-white p-3 rounded-2xl shadow-3xl flex flex-col items-center gap-0.5 min-w-[100px] border border-white/20">
                                <span className="text-[7px] font-black uppercase tracking-widest opacity-60 leading-none">{d.name}</span>
                                <span className="text-sm font-black font-headline tracking-tight leading-loose">{formatRupiah(d.value)}</span>
                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rotate-45 border-r border-b border-primary" />
                            </div>
                        </foreignObject>
                     </g>
                   );
                })}
            </svg>
        </div>

        {/* X-Axis Horizontal Label Layer */}
        <div className="absolute bottom-0 inset-x-0 pl-14 md:pl-28 pr-6 md:pr-14 flex justify-between">
           {chartData.map((d, i) => {
             const shouldShow = labelSkipCount === 0 || i % (labelSkipCount + 1) === 0 || i === chartData.length - 1;
             return (
               <div key={i} className="flex flex-col items-center flex-1">
                  <div className={cn("w-[1px] h-2 bg-outline/20 mb-3", (!shouldShow || i === 0 || i === chartData.length - 1) && "opacity-0")} />
                  {shouldShow && (
                    <div className="flex flex-col items-center">
                        <span className={cn("text-[7px] md:text-[8px] font-black transition-colors uppercase tracking-tight", hoveredPoint === i ? "text-primary opacity-100" : "text-outline/40 opacity-60")}>
                            {d.name.split(' ')[0]}
                        </span>
                        <span className="text-[6px] md:text-[7px] font-bold text-outline uppercase tracking-widest opacity-30 mt-0.5 whitespace-nowrap">
                            {d.name.split(' ')[1]}
                        </span>
                    </div>
                  )}
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
}
