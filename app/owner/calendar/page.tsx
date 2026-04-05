"use client";

import { useEffect, useState, useMemo } from "react";
import { ChevronRight, Lock, Loader2, ChevronLeft, Building, Plus, Trash2, ArrowLeft, Users, MapPin, Calendar, LayoutGrid, Search, Phone, ExternalLink, Mail, Info, Edit2, MoreHorizontal, MessageSquare, Clock } from "lucide-react";
import { cn, formatRupiah, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOwnerCalendarDataExtended, blockTanggal, deleteBlockTanggal } from "@/lib/actions/pemesanan";
import { DashboardHeader } from "@/components/custom/DashboardHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/custom/Pagination";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";

const calculateDurationDays = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.abs(e.getTime() - s.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
};

const formatRangeDate = (start: string, end: string) => {
  if (start === end) return formatDate(start);
  const s = new Date(start);
  const e = new Date(end);
  const startDay = s.getDate();
  const options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
  const monthYear = e.toLocaleDateString('id-ID', options);
  return `${startDay} - ${e.getDate()} ${monthYear}`;
};

export default function OwnerCalendarPage() {
  const [data, setData] = useState<{ spaces: any[], bookings: any[], blockedDates: any[] }>({ spaces: [], bookings: [], blockedDates: [] });
  const [loading, setLoading] = useState(true);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Search & Pagination State for Spaces
  const [spaceSearch, setSpaceSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Table State
  const [tableSearch, setTableSearch] = useState("");
  const [tableCurrentPage, setTableCurrentPage] = useState(1);
  const tableItemsPerPage = 4;

  // Detail Popups State
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [blockFormData, setBlockFormData] = useState({
    id: "", // for edit
    tanggal_mulai: "",
    tanggal_selesai: "",
    alasan: "Maintenance"
  });

  const fetchData = async () => {
    setLoading(true);
    const result = await getOwnerCalendarDataExtended();
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedSpace = useMemo(() => {
    return data.spaces.find(s => s.id === selectedSpaceId);
  }, [data.spaces, selectedSpaceId]);

  const filteredBookings = useMemo(() => {
    if (!selectedSpaceId) return [];
    return data.bookings.filter(b => b.ruangan_id === selectedSpaceId);
  }, [data.bookings, selectedSpaceId]);

  const filteredBlocked = useMemo(() => {
    if (!selectedSpaceId) return [];
    return data.blockedDates.filter(b => b.ruangan_id === selectedSpaceId);
  }, [data.blockedDates, selectedSpaceId]);

  // Combined events for the current month view (for the table & search)
  const allEventsForView = useMemo(() => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const startOfMonth = new Date(year, month, 1).toISOString().split('T')[0];
    const endOfMonth = new Date(year, month + 1, 0).toISOString().split('T')[0];

    const bookings = filteredBookings.filter(b => b.tanggal_mulai <= endOfMonth && b.tanggal_selesai >= startOfMonth)
      .map(b => ({ ...b, type: 'BOOKING' }));
    
    const blocked = filteredBlocked.filter(b => b.tanggal_mulai <= endOfMonth && b.tanggal_selesai >= startOfMonth)
      .map(b => ({ ...b, type: 'BLOCKED' }));

    let result = [...bookings, ...blocked];

    // Table Search filtering
    if (tableSearch) {
       const s = tableSearch.toLowerCase();
       result = result.filter(ev => 
          ev.kode_pemesanan?.toLowerCase().includes(s) || 
          ev.tanggal_mulai.includes(s) || 
          ev.alasan?.toLowerCase().includes(s) ||
          ev.penyewa?.nama_lengkap.toLowerCase().includes(s)
       );
    }

    return result.sort((a, b) => a.tanggal_mulai.localeCompare(b.tanggal_mulai));
  }, [filteredBookings, filteredBlocked, currentDate, tableSearch]);

  // Paginated Table Events
  const paginatedTableEvents = useMemo(() => {
    const start = (tableCurrentPage - 1) * tableItemsPerPage;
    return allEventsForView.slice(start, start + tableItemsPerPage);
  }, [allEventsForView, tableCurrentPage]);

  const tableTotalPages = Math.ceil(allEventsForView.length / tableItemsPerPage);

  // Handle Search & Pagination for Space Selector
  const processedSpaces = useMemo(() => {
    let result = data.spaces;
    if (spaceSearch) {
      result = result.filter(s => 
        s.nama.toLowerCase().includes(spaceSearch.toLowerCase()) || 
        s.tipe?.toLowerCase().includes(spaceSearch.toLowerCase())
      );
    }
    return result;
  }, [data.spaces, spaceSearch]);

  const totalPages = Math.ceil(processedSpaces.length / itemsPerPage);
  const paginatedSpaces = processedSpaces.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const calendarDays = [];
  const totalDays = daysInMonth(year, month);
  const startDay = startDayOfMonth(year, month);
  const prevMonthDays = daysInMonth(year, month - 1);
  
  for (let i = startDay - 1; i >= 0; i--) calendarDays.push({ day: prevMonthDays - i, month: month - 1, year, isCurrentMonth: false });
  for (let i = 1; i <= totalDays; i++) calendarDays.push({ day: i, month: month, year, isCurrentMonth: true });
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) calendarDays.push({ day: i, month: month + 1, year, isCurrentMonth: false });

  const getEventsForDay = (d: number, m: number, y: number) => {
    const dayStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const bookings = filteredBookings.filter(b => dayStr >= b.tanggal_mulai && dayStr <= b.tanggal_selesai);
    const blocked = filteredBlocked.filter(b => dayStr >= b.tanggal_mulai && dayStr <= b.tanggal_selesai);
    return { bookings, blocked };
  };

  const handleDayClick = (d: number, m: number, y: number, e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return; 
    const dayStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    setBlockFormData({ id: "", tanggal_mulai: dayStr, tanggal_selesai: dayStr, alasan: "Maintenance" });
    setShowBlockDialog(true);
  };

  const handleShowBookingDetail = (booking: any) => {
    setSelectedEvent(booking);
    setShowDetailDialog(true);
  };

  const handleEditBlock = (block: any) => {
    setBlockFormData({ id: block.id, tanggal_mulai: block.tanggal_mulai, tanggal_selesai: block.tanggal_selesai, alasan: block.alasan });
    setShowBlockDialog(true);
  };

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpaceId) return;
    setSubmitting(true);
    const result = await blockTanggal(selectedSpaceId, blockFormData.tanggal_mulai, blockFormData.tanggal_selesai, blockFormData.alasan);
    if ("error" in result) alert(result.error);
    else { setShowBlockDialog(false); fetchData(); }
    setSubmitting(false);
  };

  const handleDeleteBlock = async (id: string) => {
    if (!confirm("Hapus blokir tanggal ini?")) return;
    const result = await deleteBlockTanggal(id);
    if ("error" in result) alert(result.error);
    else fetchData();
  };

  if (loading) return (
    <div className="flex flex-col h-full bg-surface">
      <DashboardHeader title="Availability Hub" role="OWNER" subtitle="Synchronizing your schedule data..." />
      <div className="flex items-center justify-center flex-1 h-full py-40"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-surface pb-20 md:pb-0 overflow-y-auto no-scrollbar">
      <DashboardHeader title={selectedSpace ? selectedSpace.nama : "Availability Hub"} role="OWNER" subtitle={selectedSpace ? "Focused Space Insights" : "Manage Your Assets"} />

      <section className="px-4 md:px-8 py-6 w-full flex-1 space-y-10 mb-20">
        {!selectedSpaceId ? (
          /* Selection View */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-on-surface font-headline tracking-tighter">Pilih Ruangan</h2>
                <p className="text-on-surface-variant font-medium mt-1">Kelola jadwal reservasi dan ketersediaan per unit.</p>
              </div>
              <div className="relative w-full md:w-80"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-4 h-4" /><Input className="pl-11 pr-4 h-12 bg-white border outline-none rounded-2xl w-full focus:ring-2 focus:ring-primary/20 shadow-sm" placeholder="Cari ruangan..." value={spaceSearch} onChange={(e) => setSpaceSearch(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedSpaces.map((space) => (
                <div key={space.id} onClick={() => setSelectedSpaceId(space.id)} className="bg-white border rounded-3xl p-6 hover:shadow-2xl hover:shadow-primary/5 cursor-pointer group transition-all">
                  <div className="flex items-center justify-between mb-4"><div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Building className="w-6 h-6" /></div><span className="px-3 py-1 bg-surface-container-low text-[10px] font-black uppercase tracking-widest text-on-surface-variant rounded-full">{space.tipe?.replace(/_/g, ' ')}</span></div>
                  <h3 className="text-xl font-black text-on-surface group-hover:text-primary transition-colors font-headline truncate mb-4">{space.nama}</h3>
                  <Button className="w-full h-11 bg-surface-container-low hover:bg-primary hover:text-white text-on-surface font-black rounded-xl transition-all gap-2">Kelola Jadwal <ChevronRight className="w-4 h-4 ml-auto" /></Button>
                </div>
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        ) : (
          /* Calendar Focused View */
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <Button variant="ghost" onClick={() => setSelectedSpaceId(null)} className="p-0 h-fit text-primary font-black uppercase text-xs gap-1.5 hover:bg-transparent"><ArrowLeft className="w-4 h-4" /> Kembali</Button>
                <h2 className="text-2xl md:text-3xl font-black text-on-surface font-headline tracking-tighter">{selectedSpace?.nama}</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-white border p-1 rounded-xl shadow-sm">
                  <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="h-9 w-9"><ChevronLeft className="w-4 h-4" /></Button>
                  <div className="px-4 text-sm font-black font-headline min-w-[140px] text-center">{monthNames[month]} {year}</div>
                  <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="h-9 w-9"><ChevronRight className="w-4 h-4" /></Button>
                </div>
                <Button variant="outline" onClick={() => setCurrentDate(new Date())} className="rounded-xl font-bold h-11 border-2 border-primary/20 text-primary">Today</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Main Content Area (Column 9) */}
              <div className="xl:col-span-9 space-y-10">
                 {/* Table Details Section */}
                 <div className="bg-white border rounded-[2rem] p-8 shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                       <div>
                         <h3 className="text-xl font-black text-on-surface font-headline tracking-tighter">Schedule Details</h3>
                         <p className="text-sm text-on-surface-variant font-medium mt-1">Showing {tableItemsPerPage} items per page.</p>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" /><Input className="pl-10 pr-4 h-11 bg-surface-container-low border-none rounded-xl text-xs font-bold w-full md:w-60 focus:ring-2 focus:ring-primary/20 shadow-inner" placeholder="Cari jadwal/penyewa..." value={tableSearch} onChange={(e) => { setTableSearch(e.target.value); setTableCurrentPage(1); }} /></div>
                          <Button onClick={() => setShowBlockDialog(true)} className="rounded-xl font-black gap-2 py-5 bg-primary text-white shadow-lg shadow-primary/20">
                             <Plus className="w-4 h-4" /> Blokir
                          </Button>
                       </div>
                    </div>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader><TableRow className="border-none bg-surface-container-low/50 rounded-xl overflow-hidden"><TableHead className="font-black text-[10px] uppercase text-outline tracking-widest pl-6">Date Range & Duration</TableHead><TableHead className="font-black text-[10px] uppercase text-outline tracking-widest">Activity</TableHead><TableHead className="font-black text-[10px] uppercase text-outline tracking-widest">Tenant / Reason</TableHead><TableHead className="font-black text-[10px] uppercase text-outline tracking-widest text-right pr-6">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                           {paginatedTableEvents.map((ev, i) => {
                             const duration = calculateDurationDays(ev.tanggal_mulai, ev.tanggal_selesai);
                             return (
                             <TableRow key={i} className="group hover:bg-surface-container-low/30 transition-colors border-outline/5 cursor-pointer" onClick={() => ev.type === 'BOOKING' ? handleShowBookingDetail(ev) : handleEditBlock(ev)}>
                                <TableCell className="pl-6">
                                   <div className="flex flex-col">
                                      <span className="font-black text-xs text-on-surface whitespace-nowrap">
                                         {formatRangeDate(ev.tanggal_mulai, ev.tanggal_selesai)}
                                      </span>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                         <Clock className="w-2.5 h-2.5 text-primary" />
                                         <span className="text-[10px] font-bold text-outline uppercase">{duration} Hari {ev.jam_mulai && `(${ev.jam_mulai.slice(0,5)} - ${ev.jam_selesai.slice(0,5)})`}</span>
                                      </div>
                                   </div>
                                </TableCell>
                                <TableCell>
                                   <div className="flex items-center gap-3">
                                     <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", ev.type === 'BLOCKED' ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary")}>{ev.type === 'BLOCKED' ? <Lock className="w-4 h-4" /> : <Building className="w-4 h-4" />}</div>
                                     <span className="font-black text-xs uppercase tracking-tight">{ev.type === 'BLOCKED' ? "Maintenance" : ev.kode_pemesanan}</span>
                                   </div>
                                </TableCell>
                                <TableCell><span className="text-xs font-bold text-on-surface-variant font-label">{ev.type === 'BLOCKED' ? ev.alasan : (ev.penyewa?.nama_lengkap || 'Unknown Tenant')}</span></TableCell>
                                <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                                   <DropdownMenu>
                                     <DropdownMenuTrigger className="h-8 w-8 hover:bg-surface-container-low rounded-lg flex items-center justify-center outline-none transition-colors">
                                        <MoreHorizontal className="w-4 h-4" />
                                     </DropdownMenuTrigger>
                                     <DropdownMenuContent align="end" className="rounded-xl shadow-xl w-44 p-1.5 border-outline/5">
                                        {ev.type === 'BOOKING' ? (
                                          <DropdownMenuItem onClick={() => handleShowBookingDetail(ev)} className="font-bold text-xs gap-2 py-2.5 rounded-lg focus:bg-primary/5 focus:text-primary transition-colors"><Info className="w-4 h-4" /> View Booking</DropdownMenuItem>
                                        ) : (
                                          <>
                                            <DropdownMenuItem onClick={() => handleEditBlock(ev)} className="font-bold text-xs gap-2 py-2.5 rounded-lg focus:bg-primary/5 focus:text-primary transition-colors"><Edit2 className="w-4 h-4" /> Edit Alasan</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeleteBlock(ev.id)} className="font-bold text-xs gap-2 py-2.5 rounded-lg text-red-500 focus:bg-red-50 focus:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /> Hapus Blokir</DropdownMenuItem>
                                          </>
                                        )}
                                     </DropdownMenuContent>
                                   </DropdownMenu>
                                </TableCell>
                             </TableRow>
                           )})}
                           {paginatedTableEvents.length === 0 && (
                             <TableRow><TableCell colSpan={4} className="py-20 text-center"><Info className="w-12 h-12 text-outline/20 mx-auto mb-3" /><p className="text-on-surface-variant font-black">No scheduled events for this month.</p></TableCell></TableRow>
                           )}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="pt-8 border-t border-outline/5 flex justify-center">
                      <Pagination 
                        currentPage={tableCurrentPage} 
                        totalPages={tableTotalPages || 1} 
                        onPageChange={setTableCurrentPage} 
                      />
                    </div>
                 </div>

                 {/* Calendar Grid */}
                 <div className="bg-white rounded-[2.5rem] shadow-sm border overflow-hidden flex flex-col min-h-[750px]">
                    <div className="grid grid-cols-7 border-b bg-surface-container-lowest/50">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="py-5 text-center text-[10px] font-black text-outline uppercase tracking-[0.2em]">{d}</div>)}</div>
                    <div className="grid grid-cols-7 flex-1 bg-surface-container-low/10">
                    {calendarDays.map((dateObj, idx) => {
                        const { bookings, blocked } = getEventsForDay(dateObj.day, dateObj.month, dateObj.year);
                        const isToday = new Date().toDateString() === new Date(dateObj.year, dateObj.month, dateObj.day).toDateString();
                        return (
                        <div key={idx} onClick={(e) => handleDayClick(dateObj.day, dateObj.month, dateObj.year, e)} className={cn("p-2 md:p-3 bg-white border-r border-b min-h-[130px] hover:bg-surface-container-low/30 transition-colors cursor-pointer group relative", !dateObj.isCurrentMonth && "opacity-30", isToday && "bg-primary/5")}>
                            <div className="mb-3"><span className={cn("text-xs font-black", isToday ? "text-primary px-2 py-1 bg-primary/10 rounded-lg" : "text-on-surface")}>{dateObj.day}</span></div>
                            <div className="space-y-1.5 overflow-hidden">
                            {blocked.map(b => (
                                <div key={b.id} onClick={(e) => { e.stopPropagation(); handleEditBlock(b); }} className="px-2 py-1.5 bg-red-500 text-white text-[9px] font-black rounded-lg shadow-sm truncate flex items-center gap-1.5 animate-in slide-in-from-top-1"><Lock className="w-2.5 h-2.5" /> Maintenance</div>
                            ))}
                            {bookings.map(b => (
                                <div key={b.id} onClick={(e) => { e.stopPropagation(); handleShowBookingDetail(b); }} className={cn("px-2 py-1.5 text-[9px] font-black rounded-lg border shadow-sm truncate hover:scale-[1.02] transition-all animate-in slide-in-from-top-1", b.status === 'DIKONFIRMASI' ? "bg-green-500 text-white border-none" : "bg-white text-primary border-primary/20")}>{b.kode_pemesanan}</div>
                            ))}
                            </div>
                        </div>
                        );
                    })}
                    </div>
                 </div>
              </div>

              {/* Legend & Stats Sidebar (Column 3) */}
              <div className="xl:col-span-3">
                <div className="bg-white border p-7 rounded-[2rem] shadow-sm space-y-6 sticky top-24">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm"><Calendar className="w-6 h-6" /></div>
                      <h3 className="text-xl font-black font-headline text-on-surface leading-tight">Monthly<br/>Recap</h3>
                   </div>
                   
                   <div className="space-y-3">
                      <div className="p-4 bg-surface-container-low rounded-2xl border border-outline/5"><p className="text-[10px] font-black text-outline uppercase tracking-widest mb-1">Bookings</p><div className="flex items-baseline gap-2"><p className="text-3xl font-black text-primary">{filteredBookings.length}</p><span className="text-[10px] font-bold text-outline">Units</span></div></div>
                      <div className="p-4 bg-surface-container-low rounded-2xl border border-outline/5"><p className="text-[10px] font-black text-outline uppercase tracking-widest mb-1">Blocked</p><div className="flex items-baseline gap-2"><p className="text-3xl font-black text-on-surface">{filteredBlocked.length}</p><span className="text-[10px] font-bold text-outline">Days</span></div></div>
                   </div>

                   <div className="pt-6 border-t border-outline/5 space-y-4">
                      <h3 className="text-[10px] font-black text-outline uppercase tracking-[0.2em] mb-4">Legend</h3>
                      <div className="space-y-4">
                         <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-lg bg-green-500 border-2 border-green-500/20 shadow-sm" /> <span className="text-xs font-black text-on-surface-variant">Confirmed</span></div>
                         <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-lg bg-white border-2 border-primary/20 shadow-sm" /> <span className="text-xs font-black text-on-surface-variant">Pending</span></div>
                         <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-lg bg-red-500 border-2 border-red-500/20 shadow-sm" /> <span className="text-xs font-black text-on-surface-variant">Blocked</span></div>
                      </div>
                   </div>

                   <Button className="w-full h-14 bg-surface-container-low hover:bg-primary hover:text-white text-primary rounded-2xl font-black text-xs gap-3 transition-all" onClick={() => setCurrentDate(new Date())}><LayoutGrid className="w-4 h-4" /> Reset View</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Booking Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[480px] rounded-[3rem] !p-0 overflow-hidden border-none shadow-3xl">
           {/* Header Info Penyewa */}
           <div className="bg-primary pt-10 pb-20 px-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 -translate-y-1/2 translate-x-1/2 rounded-full" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 translate-y-1/2 -translate-x-1/2 rounded-full" />
              <div className="relative z-10 flex flex-col items-center text-center">
                 <div className="w-24 h-24 rounded-[2rem] bg-white p-1 shadow-2xl mb-5 ring-4 ring-white/20">
                    <div className="w-full h-full rounded-[1.8rem] bg-primary/10 flex items-center justify-center text-primary font-black text-3xl overflow-hidden shadow-inner">
                       {selectedEvent?.penyewa?.avatar_url ? (
                          <img src={selectedEvent.penyewa.avatar_url} alt="" className="w-full h-full object-cover" />
                       ) : (
                          selectedEvent?.penyewa?.nama_lengkap?.charAt(0) || 'U'
                       )}
                    </div>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Informasi Penyewa</p>
                 <DialogTitle className="text-3xl font-black font-headline tracking-tighter mb-1">{selectedEvent?.penyewa?.nama_lengkap || 'Unknown Tenant'}</DialogTitle>
                 <div className="flex items-center gap-4 text-white/70 text-xs font-bold bg-white/10 px-4 py-2 rounded-full border border-white/10 mt-2">
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {selectedEvent?.penyewa?.email || '-'}</span>
                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {selectedEvent?.penyewa?.nomor_telepon || '-'}</span>
                 </div>
              </div>
           </div>

           {selectedEvent && (
             <div className="relative z-20 -mt-10 mx-6 mb-8 bg-white rounded-[2.5rem] p-8 shadow-2xl space-y-6 animate-in slide-in-from-bottom-8">
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-surface-container-low p-5 rounded-3xl space-y-1">
                      <p className="text-[9px] font-black text-outline uppercase tracking-widest flex items-center gap-2"><Calendar className="w-3 h-3" /> Jadwal Sewa</p>
                      <p className="text-sm font-black text-on-surface">
                         {formatRangeDate(selectedEvent.tanggal_mulai, selectedEvent.tanggal_selesai)}
                      </p>
                      <div className="flex items-center gap-1.5">
                         <div className="bg-primary/20 px-2 py-0.5 rounded text-[9px] font-black text-primary uppercase">
                            {calculateDurationDays(selectedEvent.tanggal_mulai, selectedEvent.tanggal_selesai)} Hari
                         </div>
                         <p className="text-[10px] font-bold text-outline">
                            {selectedEvent.jam_mulai ? `${selectedEvent.jam_mulai.slice(0,5)} - ${selectedEvent.jam_selesai.slice(0,5)}` : 'Harian'}
                         </p>
                      </div>
                   </div>
                   <div className="bg-surface-container-low p-5 rounded-3xl space-y-1">
                      <p className="text-[9px] font-black text-outline uppercase tracking-widest flex items-center gap-2"><LayoutGrid className="w-3 h-3" /> Booking ID</p>
                      <p className="text-sm font-black text-on-surface tracking-tight">{selectedEvent.kode_pemesanan}</p>
                      <div className="flex items-center gap-1.5 pt-0.5">
                         <div className={cn("w-1.5 h-1.5 rounded-full", selectedEvent.status === 'DIKONFIRMASI' ? 'bg-green-500' : 'bg-primary')} />
                         <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{selectedEvent.status}</p>
                      </div>
                   </div>
                </div>

                <div className="pt-2 border-t border-outline/5">
                   <div className="flex items-center justify-between mb-8">
                      <div className="space-y-0.5">
                         <p className="text-[10px] font-black text-outline uppercase tracking-[0.2em]">Total Transaksi</p>
                         <p className="text-3xl font-black text-on-surface font-headline tracking-tighter">{formatRupiah(selectedEvent.total_harga)}</p>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center text-outline/30"><ExternalLink className="w-6 h-6" /></div>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                      <Button className="h-14 rounded-2xl bg-primary text-white font-black text-xs gap-3 group border-none shadow-lg shadow-primary/20">
                         <a href={`mailto:${selectedEvent?.penyewa?.email}`}>
                            <Mail className="w-4 h-4 text-white transition-transform group-hover:scale-110" /> Email Tenant
                         </a>
                      </Button>
                      <Button className="h-14 rounded-2xl bg-surface text-on-surface border-2 border-outline/10 hover:bg-on-surface hover:text-white font-black text-xs gap-3 transition-colors group">
                         <Link href={`/owner/messages?chat=${selectedEvent?.penyewa?.id}`}>
                            <MessageSquare className="w-4 h-4 text-primary group-hover:text-white transition-colors" /> Chat in App
                         </Link>
                      </Button>
                   </div>
                   <Button variant="ghost" className="w-full mt-3 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest text-outline hover:text-red-500 hover:bg-transparent" onClick={() => setShowDetailDialog(false)}>Close Summary</Button>
                </div>
             </div>
           )}
        </DialogContent>
      </Dialog>

      {/* Block Date Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent className="sm:max-w-[425px] rounded-[3rem] !p-0 overflow-hidden border-none shadow-3xl">
          <div className="gradient-primary px-8 py-10 text-white relative">
            <div className="relative z-10">
               <DialogTitle className="text-3xl font-black font-headline tracking-tighter">{blockFormData.id ? "Update Alasan" : "Tutup Jadwal"}</DialogTitle>
               <DialogDescription className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">Status: Operational Lock</DialogDescription>
            </div>
            <Lock className="absolute right-6 top-1/2 -translate-y-1/2 w-20 h-20 opacity-20 rotate-12" />
          </div>
          <form onSubmit={handleBlockSubmit} className="p-8 space-y-6 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-outline tracking-widest px-1">Mulai</Label>
                <Input type="date" value={blockFormData.tanggal_mulai} onChange={e => setBlockFormData(p => ({...p, tanggal_mulai: e.target.value}))} className="rounded-2xl h-14 bg-surface-container-low border-none shadow-inner font-black px-4" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-outline tracking-widest px-1">Selesai</Label>
                <Input type="date" value={blockFormData.tanggal_selesai} onChange={e => setBlockFormData(p => ({...p, tanggal_selesai: e.target.value}))} className="rounded-2xl h-14 bg-surface-container-low border-none shadow-inner font-black px-4" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-outline tracking-widest px-1">Alasan Penutupan</Label>
              <Input placeholder="Contoh: Perbaikan Plumbing..." value={blockFormData.alasan} onChange={e => setBlockFormData(p => ({...p, alasan: e.target.value}))} className="rounded-2xl h-14 bg-surface-container-low border-none shadow-inner font-black px-4 focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setShowBlockDialog(false)} className="h-14 rounded-2xl font-black text-xs flex-1">Batal</Button>
              <Button type="submit" disabled={submitting} className="h-14 gradient-primary text-white font-black text-xs rounded-2xl flex-1 shadow-xl shadow-primary/30 active:scale-95 transition-all">{submitting ? "Processing..." : "Konfirmasi"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
