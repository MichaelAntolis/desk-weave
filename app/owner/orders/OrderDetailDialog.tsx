"use client";

import { Button } from "@/components/ui/button";
import { formatRupiah, formatDate } from "@/lib/utils";
import { Eye, Calendar, User, MapPin, CreditCard, Hash, MessageSquare } from "lucide-react";

interface OrderDetailDialogProps {
  order: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailDialog({ order, open, onOpenChange }: OrderDetailDialogProps) {
  if (!open || !order) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-outline/10 flex justify-between items-center bg-primary/5">
            <div>
              <h2 className="text-xl font-bold font-headline text-primary">Detail Pesanan</h2>
              <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1 font-mono">
                <Hash className="w-3 h-3" /> {order.kode_pemesanan}
              </p>
            </div>
            <button onClick={() => onOpenChange(false)} className="text-on-surface-variant hover:text-on-surface">
                <XIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Status Section */}
            <div className="flex justify-between items-center bg-surface-container p-4 rounded-xl">
               <div>
                  <span className="text-[10px] uppercase tracking-widest text-on-surface-variant block mb-1">Status</span>
                  <div className="font-bold text-sm">{order.status}</div>
               </div>
               {order.bukti_pembayaran_url && (
                  <a 
                    href={order.bukti_pembayaran_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-bold text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-lg"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Lihat Bukti Bayar
                  </a>
               )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-on-surface-variant flex items-center gap-2 mb-2 font-bold focus:shadow-md">
                    <BuildingIcon className="w-3.5 h-3.5" /> Ruangan
                  </h3>
                  <p className="font-bold text-sm text-on-surface">{order.ruangan?.nama}</p>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {order.ruangan?.lokasi}
                  </p>
                </div>
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-on-surface-variant flex items-center gap-2 mb-2 font-bold">
                    <User className="w-3.5 h-3.5" /> Penyewa
                  </h3>
                  <p className="font-bold text-sm text-on-surface">{order.penyewa?.nama_lengkap}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{order.penyewa?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-on-surface-variant flex items-center gap-2 mb-2 font-bold">
                    <Calendar className="w-3.5 h-3.5" /> Jadwal
                  </h3>
                  <p className="font-bold text-sm text-on-surface">
                    {formatDate(order.tanggal_mulai)} — {formatDate(order.tanggal_selesai)}
                  </p>
                  {order.jam_mulai && (
                    <p className="text-xs text-on-surface-variant mt-1">
                      Waktu: {order.jam_mulai} - {order.jam_selesai}
                    </p>
                  )}
                </div>
                <div>
                    <h3 className="text-[10px] uppercase tracking-widest text-on-surface-variant flex items-center gap-2 mb-2 font-bold">
                        <CreditCard className="w-3.5 h-3.5" /> Total Pembayaran
                    </h3>
                    <p className="font-black text-lg text-primary font-headline">{formatRupiah(order.total_harga)}</p>
                </div>
              </div>
            </div>

            {order.catatan_penyewa && (
              <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-700/20 rounded-xl p-4">
                <h3 className="text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-500 font-bold flex items-center gap-2 mb-2">
                  <MessageSquare className="w-3.5 h-3.5" /> Catatan Penyewa
                </h3>
                <p className="text-sm text-on-surface/80 italic">"{order.catatan_penyewa}"</p>
              </div>
            )}
            
            <div className="space-y-1 text-[10px] text-on-surface-variant/60 pt-4 border-t border-outline/10 text-center">
                <p>Pesanan dibuat pada {formatDate(order.dibuat_pada)}</p>
                <p>ID: {order.id}</p>
            </div>
            
            <div className="pt-4">
                <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full font-bold">
                    Tutup
                </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BuildingIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/>
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
