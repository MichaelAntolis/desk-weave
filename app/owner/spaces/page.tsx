"use client";

import { useEffect, useState } from "react";
import {
  Plus, MoreHorizontal, Eye, Pencil, Trash2, Star, MapPin, Users, Loader2, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DashboardHeader } from "@/components/custom/DashboardHeader";
import { formatRupiah } from "@/lib/utils";
import { getOwnerRuangan } from "@/lib/actions/pemesanan";
import { deleteRuangan } from "@/lib/actions/owner-ruangan";
import { AddSpaceDialog } from "./AddSpaceDialog";
import { Pagination } from "@/components/custom/Pagination";

export default function OwnerSpacesPage() {
  const [spaces, setSpaces] = useState<Awaited<ReturnType<typeof getOwnerRuangan>>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSpace, setEditingSpace] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchSpaces = async () => {
    setLoading(true);
    const data = await getOwnerRuangan();
    setSpaces(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus ruangan ini? Tindakan ini tidak dapat dibatalkan.")) return;
    const result = await deleteRuangan(id);
    if (result.error) {
      alert(result.error);
      return;
    }
    fetchSpaces();
  };

  const handleEdit = (space: any) => {
    setEditingSpace(space);
    setShowAddDialog(true);
  };

  const filteredSpaces = spaces.filter((s) =>
    s.nama.toLowerCase().includes(search.toLowerCase()) ||
    s.lokasi.toLowerCase().includes(search.toLowerCase()) ||
    s.kota.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filteredSpaces.length / itemsPerPage);
  const paginatedSpaces = filteredSpaces.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-full bg-surface">
      <DashboardHeader 
        title="Ruang Kerja Saya" 
        role="OWNER" 
        subtitle="Spaces"
        rightActions={
          <Button
            onClick={() => {
              setEditingSpace(null);
              setShowAddDialog(true);
            }}
            className="md:mr-2 gradient-primary text-white font-bold px-5 py-2 h-10 rounded-xl shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95 text-xs md:text-sm"
          >
            <Plus className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden md:inline">Tambah Ruangan Baru</span>
            <span className="inline md:hidden">Tambah</span>
          </Button>
        }
      />

      <section className="px-4 md:px-8 py-6 md:py-8 flex-1 space-y-6">
        {/* Search */}
        <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline/10 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
          <Input
            placeholder="Cari berdasarkan nama, lokasi, atau kota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 bg-surface-container-low border-none py-6 rounded-xl"
          />
        </div>
      </div>

      {/* Space Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredSpaces.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedSpaces.map((space) => (
              <div
                key={space.id}
                className="bg-surface-container-lowest border border-outline/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
              >
                <div className="relative aspect-[16/9] bg-surface-container overflow-hidden">
                  <img
                    src={space.foto_utama || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"}
                    alt={space.nama}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="bg-white/80 backdrop-blur-sm border-none shadow-md w-8 h-8 hover:bg-white transition-colors rounded-lg flex items-center justify-center outline-none">
                          <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-surface-container-lowest border-outline/10 shadow-xl rounded-xl p-1">
                        <DropdownMenuItem onClick={() => window.location.href = `/space/${space.id}`} className="cursor-pointer rounded-lg text-sm font-medium focus:bg-primary/10 focus:text-primary">
                          <Eye className="w-4 h-4 mr-2" />Lihat Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(space)} className="cursor-pointer rounded-lg text-sm font-medium focus:bg-primary/10 focus:text-primary">
                          <Pencil className="w-4 h-4 mr-2" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(space.id)}
                          className="cursor-pointer rounded-lg text-sm font-medium text-error focus:bg-error/10 focus:text-error"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${space.aktif ? "bg-green-500/80 text-white" : "bg-gray-500/80 text-white"}`}>
                      {space.aktif ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg font-headline text-on-surface line-clamp-1">{space.nama}</h3>
                    <div className="flex items-center gap-1 shrink-0 bg-surface-container px-2 py-0.5 rounded-md">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold">{space.rata_rata_rating || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{space.lokasi}, {space.kota}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
                    <Users className="w-4 h-4" />
                    <span>Kapasitas {space.kapasitas} orang</span>
                  </div>
                  <div className="pt-3 border-t border-outline/10 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-on-surface-variant">Harga /hari</span>
                      <p className="font-bold text-primary">{formatRupiah(space.harga_per_hari)}</p>
                    </div>
                    <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded-md">
                      {space.tipe?.replace(/_/g, " ")}
                    </span>
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
          <Store className="w-16 h-16 text-outline mx-auto mb-4" />
          <h3 className="text-xl font-bold font-headline text-primary mb-2">Belum Ada Ruangan</h3>
          <p className="text-on-surface-variant text-sm mb-6">Mulai dengan menambahkan ruang kerja pertama Anda.</p>
          <Button onClick={() => {
            setEditingSpace(null);
            setShowAddDialog(true);
          }} className="gradient-primary font-bold">
            <Plus className="w-4 h-4 mr-2" /> Tambah Ruangan
          </Button>
        </div>
      )}

      {/* Add/Edit Space Dialog */}
      <AddSpaceDialog
        open={showAddDialog}
        onOpenChange={(open: boolean) => {
          setShowAddDialog(open);
          if (!open) setEditingSpace(null);
        }}
        onSuccess={fetchSpaces}
        editingSpace={editingSpace}
      />
      </section>
    </div>
  );
}

// Inline Store icon component for empty state
function Store(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-9"/><path d="M14 22v-9"/><path d="M14 12v8a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-8"/><path d="M2 9h20"/><path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>
    </svg>
  );
}
