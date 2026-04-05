"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRupiah, cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Loader2, ShieldCheck, Clock, RefreshCw, ChevronLeft, ChevronRight, X, Lock, Check } from "lucide-react";
import { createPemesanan } from "@/lib/actions/pemesanan";
import { useRouter } from "next/navigation";

interface SpaceBookingWidgetProps {
  spaceId: string;
  spaceName: string;
  hargaPerHari: number;
  hargaPerJam: number;
  isLoggedIn: boolean;
  pemilikId: string;
  blockedDates: any[];
}

export function SpaceBookingWidget({
  spaceId,
  spaceName,
  hargaPerHari,
  hargaPerJam,
  isLoggedIn,
  pemilikId,
  blockedDates = [],
}: SpaceBookingWidgetProps) {
  const router = useRouter();
  const [bookingType, setBookingType] = useState<"daily" | "hourly">("daily");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calendar & Time States
  const [showPicker, setShowPicker] = useState<"start" | "end" | "time-start" | "time-end" | null>(null);
  const [pickerDate, setPickerDate] = useState(new Date());

  const formatDateToISO = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Check if a date is blocked
  const isDateBlocked = (date: Date) => {
    const dStr = formatDateToISO(date);
    return blockedDates.find(b => dStr >= b.tanggal_mulai && dStr <= b.tanggal_selesai);
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    return !!isDateBlocked(date);
  };

  // Calculate total
  let totalUnits = 0;
  let durationError = false;

  if (bookingType === "daily") {
    totalUnits = startDate && endDate
      ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)
      : 0;
  } else {
    if (startDate && startTime && endTime) {
      const [h1, m1] = startTime.split(":").map(Number);
      const [h2, m2] = endTime.split(":").map(Number);
      const startMinutes = h1 * 60 + m1;
      const endMinutes = h2 * 60 + m2;
      const diffMinutes = endMinutes - startMinutes;
      if (diffMinutes <= 0) {
        totalUnits = 0;
        durationError = true;
      } else {
        totalUnits = Math.ceil(diffMinutes / 60);
      }
    }
  }

  const subtotal = bookingType === "daily" ? totalUnits * hargaPerHari : totalUnits * (hargaPerJam || 0);
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee;

  async function handleBooking() {
    if (!isLoggedIn) {
      router.push(`/login?redirectTo=/space/${spaceId}`);
      return;
    }

    if (!startDate || (bookingType === "daily" && !endDate)) {
      setError("Silakan pilih tanggal yang diperlukan.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("ruangan_id", spaceId);
    formData.set("tanggal_mulai", startDate);
    formData.set("tanggal_selesai", bookingType === "daily" ? endDate : startDate);
    formData.set("total_harga", total.toString());
    
    if (bookingType === "hourly") {
        formData.set("jam_mulai", startTime);
        formData.set("jam_selesai", endTime);
    }

    const result = await createPemesanan(formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const bookingData = result.data as { id: string } | undefined;
    router.push(`/checkout?id=${bookingData?.id}`);
  }

  // --- Calendar Picker ---
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
      <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl border border-outline/10 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-black text-sm text-primary uppercase tracking-[0.2em]">{monthName}</h4>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => setPickerDate(new Date(year, month - 1, 1))} className="h-9 w-9 rounded-full bg-surface-container-low">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setPickerDate(new Date(year, month + 1, 1))} className="h-9 w-9 rounded-full bg-surface-container-low">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5 mb-4">
          {["S", "S", "R", "K", "J", "S", "M"].map((d, i) => (
            <div key={`${d}-${i}`} className="text-[10px] font-black text-outline/40 text-center py-1">{d}</div>
          ))}
          {days.map((date, idx) => {
            if (!date) return <div key={idx} />;
            const disabled = isDateDisabled(date);
            const blocked = isDateBlocked(date);
            const dStr = formatDateToISO(date);
            const isSelected = showPicker === "start" ? startDate === dStr : endDate === dStr;
            const isRange = startDate && endDate && dStr > startDate && dStr < endDate;

            return (
              <button
                key={idx}
                disabled={disabled}
                onClick={() => {
                  if (showPicker === "start") {
                    setStartDate(dStr);
                    if (bookingType === "daily" && endDate && dStr > endDate) setEndDate("");
                    setShowPicker(bookingType === "daily" ? "end" : null);
                  } else {
                    if (dStr < startDate) setStartDate(dStr);
                    else {
                      setEndDate(dStr);
                      setShowPicker(null);
                    }
                  }
                }}
                className={cn(
                  "aspect-square rounded-2xl text-xs font-bold transition-all relative flex flex-col items-center justify-center gap-0.5",
                  disabled ? "text-outline/10 cursor-not-allowed" : "hover:bg-primary/10 text-on-surface",
                  isSelected ? "bg-primary text-white shadow-xl shadow-primary/30 scale-105 z-10" : "",
                  isRange ? "bg-primary/5 text-primary" : "",
                  blocked && "bg-red-500/5"
                )}
              >
                {date.getDate()}
                {blocked && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // --- Modern Time Picker (No Native Select) ---
  const renderTimePicker = (type: "start" | "end") => {
    const hours = Array.from({ length: 24 }).map((_, i) => String(i).padStart(2, '0') + ":00");
    const halfHours = Array.from({ length: 24 }).map((_, i) => String(i).padStart(2, '0') + ":30");
    const allTimes = [...hours, ...halfHours].sort();
    const currentVal = type === "start" ? startTime : endTime;

    return (
       <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-6 shadow-2xl border border-outline/10 animate-in zoom-in-95 duration-300 max-h-[350px] overflow-hidden flex flex-col items-center">
          <h4 className="font-black text-[10px] text-outline uppercase tracking-[0.2em] mb-4">Pilih Waktu {type === "start" ? "Check-in" : "Check-out"}</h4>
          <div className="w-full flex-1 overflow-y-auto no-scrollbar space-y-1 py-1">
             {allTimes.map(t => (
               <button 
                key={t} 
                onClick={() => {
                   if (type === "start") setStartTime(t); else setEndTime(t);
                   setShowPicker(null);
                }}
                className={cn(
                  "w-full py-3 px-6 rounded-2xl text-sm font-black transition-all flex items-center justify-between group",
                  currentVal === t ? "bg-primary text-white shadow-lg" : "hover:bg-primary/5 text-on-surface-variant hover:text-primary"
                )}
               >
                 {t}
                 {currentVal === t && <Check className="w-4 h-4" />}
               </button>
             ))}
          </div>
       </div>
    );
  }

  return (
    <div className="sticky top-24 z-40">
      <div className="bg-surface-container-lowest rounded-[2.8rem] p-7 shadow-3xl border border-outline/5 relative transition-all duration-500">
        <div className="absolute top-0 right-0 w-40 h-40 gradient-primary opacity-[0.02] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none"></div>
        
        {/* Modern Segmented Toggle (Tab-Style) */}
        <div className="flex bg-surface-container-low p-1.5 rounded-[1.8rem] border border-outline/5 mb-8 shadow-inner relative z-10">
          <button
            onClick={() => setBookingType("daily")}
            className={cn(
               "flex-1 py-3 px-4 rounded-[1.4rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
               bookingType === "daily" ? "bg-white text-primary shadow-xl scale-[1.02]" : "text-on-surface-variant/50 hover:text-primary"
            )}
          >
            Harian
          </button>
          <button
            onClick={() => setBookingType("hourly")}
            disabled={!(hargaPerJam > 0)}
            className={cn(
               "flex-1 py-3 px-4 rounded-[1.4rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
               bookingType === "hourly" ? "bg-white text-primary shadow-xl scale-[1.02]" : "text-on-surface-variant/50 hover:text-primary",
               !(hargaPerJam > 0) && "opacity-20 grayscale pointer-events-none"
            )}
          >
            Per Jam
          </button>
        </div>

        {/* Pricing Header (Stand Alone) */}
        <div className="mb-10 space-y-2 relative z-10">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl lg:text-5xl font-black text-on-surface font-headline tracking-tighter">
              {formatRupiah(bookingType === "daily" ? hargaPerHari : hargaPerJam)}
            </span>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest opacity-50">/{bookingType === "daily" ? "hari" : "jam"}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-1 w-6 bg-primary/20 rounded-full" />
            <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.3em] font-black">Estimasi Tarif Ruang</p>
          </div>
        </div>

        {/* Date/Time Inputs Container */}
        <div className="space-y-5 mb-8">
          {/* Date Picker Trigger */}
          <div className="relative">
            <Label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-2.5 flex items-center gap-2 opacity-50 px-1">
              <CalendarIcon className="w-4 h-4" /> Jadwal Reservasi
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => setShowPicker("start")}
                className={cn(
                  "bg-surface-container-low p-5 rounded-3xl border-2 transition-all cursor-pointer group flex flex-col",
                  showPicker === "start" ? "border-primary bg-white shadow-2xl shadow-primary/5" : "border-transparent"
                )}
              >
                <p className="text-[9px] font-black text-outline uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Start</p>
                <p className="text-sm font-black text-on-surface">{startDate ? new Date(startDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' }) : "Pick Date"}</p>
              </div>
              <div 
                onClick={() => setShowPicker(bookingType === "daily" ? "end" : "start")}
                className={cn(
                  "bg-surface-container-low p-5 rounded-3xl border-2 transition-all cursor-pointer group flex flex-col",
                  showPicker === "end" ? "border-primary bg-white shadow-2xl shadow-primary/5" : "border-transparent",
                  bookingType === "hourly" && "opacity-40"
                )}
              >
                <p className="text-[9px] font-black text-outline uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">End</p>
                <p className="text-sm font-black text-on-surface">{bookingType === "daily" ? (endDate ? new Date(endDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' }) : "Pick Date") : "Same Day"}</p>
              </div>
            </div>

            {/* Calendar Popover */}
            {(showPicker === "start" || showPicker === "end") && (
               <div className="absolute top-0 md:top-full left-0 right-0 z-[100] mt-0 md:mt-4">
                  <div className="fixed inset-0 bg-black/30 backdrop-blur-md md:bg-transparent" onClick={() => setShowPicker(null)} />
                  <div className="relative">
                     {renderCalendar()}
                     <button onClick={() => setShowPicker(null)} className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white shadow-2xl flex items-center justify-center text-on-surface-variant hover:text-primary border border-outline/10 z-[110] transition-transform hover:rotate-90">
                        <X className="w-5 h-5" />
                     </button>
                  </div>
               </div>
            )}
          </div>

          {/* Time Picker Trigger */}
          {bookingType === "hourly" && (
             <div className="relative animate-in slide-in-from-top-4 duration-500">
               <Label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-2.5 flex items-center gap-2 opacity-50 px-1">
                 <Clock className="w-4 h-4" /> Durasi Jam
               </Label>
               <div className="flex items-center bg-surface-container-low rounded-[2rem] p-1 gap-1 border border-outline/5 shadow-inner group">
                  <div onClick={() => setShowPicker("time-start")} className={cn("flex-1 h-14 rounded-[1.5rem] flex flex-col items-center justify-center cursor-pointer transition-all", showPicker === "time-start" ? "bg-white shadow-lg text-primary" : "hover:bg-white/50")}>
                    <p className="text-[8px] font-black text-outline uppercase tracking-widest leading-none mb-1">In</p>
                    <p className="text-sm font-black tracking-tighter leading-none">{startTime}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-outline/20" />
                  <div onClick={() => setShowPicker("time-end")} className={cn("flex-1 h-14 rounded-[1.5rem] flex flex-col items-center justify-center cursor-pointer transition-all", showPicker === "time-end" ? "bg-white shadow-lg text-primary" : "hover:bg-white/50")}>
                    <p className="text-[8px] font-black text-outline uppercase tracking-widest leading-none mb-1">Out</p>
                    <p className="text-sm font-black tracking-tighter leading-none">{endTime}</p>
                  </div>
               </div>

               {/* Time Popover */}
               {(showPicker === "time-start" || showPicker === "time-end") && (
                 <div className="absolute top-0 md:top-full left-0 right-0 z-[110] mt-0 md:mt-4">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowPicker(null)} />
                    <div className="relative max-w-[280px] mx-auto">
                       {renderTimePicker(showPicker === "time-start" ? "start" : "end")}
                    </div>
                 </div>
               )}
             </div>
          )}
        </div>

        {/* Pricing Summary Card */}
        {totalUnits > 0 ? (
          <div className="bg-primary/5 rounded-[2.5rem] p-6 mb-8 border border-primary/10 relative overflow-hidden animate-in fade-in zoom-in-95 duration-700">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 -translate-y-1/2 translate-x-1/2 rounded-full" />
            <div className="relative z-10 space-y-4">
               <div className="space-y-2.5">
                 <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{bookingType === "daily" ? "Total Hari" : "Total Jam"}</span>
                    <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-lg">{totalUnits} Unit</span>
                 </div>
                 <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Biaya Sewa</span>
                    <span className="text-sm font-black text-on-surface">{formatRupiah(subtotal)}</span>
                 </div>
                 <div className="flex justify-between items-center px-1 pb-1">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Layanan</span>
                    <span className="text-sm font-black text-on-surface">{formatRupiah(serviceFee)}</span>
                 </div>
               </div>
               <div className="pt-4 border-t border-primary/20 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">Total Payment</span>
                    <span className="text-3xl font-black text-on-surface font-headline tracking-tighter">{formatRupiah(total)}</span>
                  </div>
                  <ShieldCheck className="w-8 h-8 text-primary/30" />
               </div>
            </div>
          </div>
        ) : durationError ? (
          <div className="mb-8 p-5 bg-red-500/5 border border-red-500/20 rounded-[2rem] text-red-600 text-[11px] font-black text-center flex items-center justify-center gap-3">
            <Lock className="w-4 h-4" /> Periksa pengaturan waktu reservasi Anda.
          </div>
        ) : null}

        {error && (
          <div className="mb-6 p-5 bg-red-600 text-white rounded-[2rem] text-[11px] font-black text-center shadow-xl shadow-red-600/30">
            {error}
          </div>
        )}

        <Button
          onClick={handleBooking}
          disabled={loading || totalUnits <= 0}
          className="w-full py-9 gradient-primary text-white rounded-[2.2rem] font-black font-headline shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-95 transition-all text-lg lg:text-xl border-t border-white/20"
        >
          {loading ? (
            <span className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" /> Processing...
            </span>
          ) : !isLoggedIn ? (
            "Get Started"
          ) : (
            "Bayar Sekarang"
          )}
        </Button>

        <div className="mt-8 flex items-center justify-center gap-3 text-on-surface-variant/20 group">
          <ShieldCheck className="w-4 h-4 transition-colors group-hover:text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] font-label">Vault-Secured</span>
        </div>
      </div>
    </div>
  );
}
