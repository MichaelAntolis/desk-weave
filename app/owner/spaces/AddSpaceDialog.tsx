"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2, Plus, X, Image as ImageIcon, Trash2, Camera, 
  RefreshCcw, Star, AlertCircle, MapPin, Users, Hash, 
  Info, Building, DollarSign
} from "lucide-react";
import { createRuangan, updateRuangan, uploadFotoRuangan, deleteFotoRuangan, setFotoUtama } from "@/lib/actions/owner-ruangan";
import { getFasilitas, getRuanganPhotos } from "@/lib/actions/ruangan";
import type { Fasilitas, TipeRuangan } from "@/lib/types/database";
import { cn } from "@/lib/utils";

interface AddSpaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingSpace?: any;
}

interface PhotoDraft {
  id?: string;
  url: string;
  file?: File;
}

const TIPE_OPTIONS: { label: string; value: TipeRuangan }[] = [
  { label: "Hot Desk", value: "HOT_DESK" },
  { label: "Dedicated Desk", value: "DEDICATED_DESK" },
  { label: "Private Office", value: "PRIVATE_OFFICE" },
  { label: "Meeting Room", value: "MEETING_ROOM" },
  { label: "Event Space", value: "EVENT_SPACE" },
  { label: "Virtual Office", value: "VIRTUAL_OFFICE" },
];

export function AddSpaceDialog({ open, onOpenChange, onSuccess, editingSpace }: AddSpaceDialogProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingPhotos, setFetchingPhotos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amenities, setAmenities] = useState<Fasilitas[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  const [draftPhotos, setDraftPhotos] = useState<PhotoDraft[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      getFasilitas().then(setAmenities);
      
      if (editingSpace) {
        setSelectedAmenities(editingSpace.fasilitas?.map((f: any) => f.id) || []);
        setThumbnailUrl(editingSpace.foto_utama || null);
        
        const loadPhotos = async () => {
          setFetchingPhotos(true);
          try {
             const photos = await getRuanganPhotos(editingSpace.id);
             if (photos && photos.length > 0) {
               setDraftPhotos(photos.map(p => ({ id: p.id, url: p.url })));
             } else if (editingSpace.foto_ruangan) {
               setDraftPhotos(editingSpace.foto_ruangan.map((p: any) => ({ id: p.id, url: p.url })));
             }
          } catch (er) {
            console.error("Fetch error:", er);
          } finally {
            setFetchingPhotos(false);
          }
        };
        loadPhotos();
      } else {
        setSelectedAmenities([]);
        setDraftPhotos([]);
        setThumbnailUrl(null);
      }
    }
  }, [open, editingSpace]);

  const handleAddPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newDrafts: PhotoDraft[] = Array.from(files).map(file => ({
      url: URL.createObjectURL(file), 
      file: file
    }));

    setDraftPhotos(prev => {
      const combined = [...prev, ...newDrafts];
      if (!thumbnailUrl && combined.length > 0) {
        setThumbnailUrl(combined[0].url);
      }
      return combined;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReplacePhoto = (index: number) => {
    setReplacingIndex(index);
    replaceInputRef.current?.click();
  };

  const onReplaceFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replacingIndex === null) return;

    const newUrl = URL.createObjectURL(file);
    const oldUrl = draftPhotos[replacingIndex].url;

    setDraftPhotos(prev => {
      const copy = [...prev];
      copy[replacingIndex] = { url: newUrl, file: file };
      return copy;
    });

    if (thumbnailUrl === oldUrl) {
      setThumbnailUrl(newUrl);
    }
    setReplacingIndex(null);
  };

  const removePhotoDraft = (index: number) => {
    const photoToRemove = draftPhotos[index];
    setDraftPhotos(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (thumbnailUrl === photoToRemove.url) {
        setThumbnailUrl(next.length > 0 ? next[0].url : null);
      }
      return next;
    });
  };

  const makeThumbnail = (index: number) => {
    setThumbnailUrl(draftPhotos[index].url);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    selectedAmenities.forEach((id) => formData.append("fasilitas_ids", id));

    const result = editingSpace 
      ? await updateRuangan(editingSpace.id, formData)
      : await createRuangan(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const spaceId = editingSpace ? editingSpace.id : (result as any).data?.id;
    if (!spaceId) {
      setError("Gagal mendapatkan ID ruangan.");
      setLoading(false);
      return;
    }

    try {
      const newPhotoDrafts = draftPhotos.filter(p => p.file);
      let uploadedServerPhotos: any[] = [];
      
      if (newPhotoDrafts.length > 0) {
        const photoFormData = new FormData();
        newPhotoDrafts.forEach(p => p.file && photoFormData.append("foto", p.file));
        const uploadResult = await uploadFotoRuangan(spaceId, photoFormData);
        
        if (uploadResult.error) {
          setError(uploadResult.error);
          setLoading(false);
          return;
        }
        uploadedServerPhotos = uploadResult.data || [];
      }

      const finalThumbnailPhoto = draftPhotos.find(p => p.url === thumbnailUrl);
      if (finalThumbnailPhoto) {
        let finalUrl = finalThumbnailPhoto.url;
        if (finalThumbnailPhoto.file) {
          const match = uploadedServerPhotos.find(up => up.storage_path.includes(finalThumbnailPhoto.file?.name));
          if (match) finalUrl = match.url;
          else if (uploadedServerPhotos.length > 0) finalUrl = uploadedServerPhotos[0].url;
        }
        await setFotoUtama(spaceId, finalUrl);
      }

      if (editingSpace) {
        const originalPhotoIds = (editingSpace.foto_ruangan || []).map((p: any) => p.id);
        const currentPhotoIds = draftPhotos.filter(p => p.id).map(p => p.id);
        const deletedIds = originalPhotoIds.filter((id: string) => !currentPhotoIds.includes(id));
        for (const id of deletedIds) {
          const photo = editingSpace.foto_ruangan.find((p: any) => p.id === id);
          if (photo) await deleteFotoRuangan(id, photo.storage_path);
        }
      }
    } catch (photoErr) {
       console.error("Critical photos err:", photoErr);
    }

    setLoading(false);
    onOpenChange(false);
    onSuccess();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-outline/10">
          
          {/* Header */}
          <div className="p-6 border-b border-outline/10 flex justify-between items-center bg-primary/5 shrink-0">
            <div>
              <h2 className="text-xl font-bold font-headline text-primary">
                {editingSpace ? "Edit Ruang Kerja" : "Tambah Ruang Kerja"}
              </h2>
              <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1 font-medium">
                <Info className="w-3.5 h-3.5 text-primary/60" /> {editingSpace ? "Ubah detail unit yang sudah ada." : "Lengkapi formulir untuk mempublikasikan unit baru."}
              </p>
            </div>
            <button onClick={() => onOpenChange(false)} className="text-on-surface-variant hover:text-on-surface transition-colors p-2 hover:bg-surface-container rounded-lg">
                <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-8">
              {/* Photo Gallery Hub */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] uppercase tracking-widest text-on-surface-variant flex items-center gap-2 font-bold">
                    <Camera className="w-3.5 h-3.5" /> Gallery Foto
                  </h3>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {fetchingPhotos ? "Loading..." : `${draftPhotos.length} / 12`}
                  </span>
                </div>
                
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                  {draftPhotos.map((photo, i) => {
                    const isThumbnail = thumbnailUrl === photo.url;
                    return (
                      <div key={i} className={cn(
                        "group relative aspect-square rounded-xl overflow-hidden border-2 transition-all",
                        isThumbnail ? "border-primary ring-2 ring-primary/20 scale-105 z-10" : "border-outline/5 hover:border-primary/30"
                      )}>
                        <img src={photo.url} alt="" className="w-full h-full object-cover" />
                        
                        {isThumbnail && (
                          <div className="absolute top-1.5 right-1.5 bg-primary text-white p-1 rounded-full shadow-lg">
                            <Star className="w-2.5 h-2.5 fill-current" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                          {!isThumbnail && (
                            <button type="button" onClick={() => makeThumbnail(i)} className="w-full py-1 bg-primary text-white rounded text-[8px] font-bold uppercase hover:bg-primary/90">
                                Sampul
                            </button>
                          )}
                          <div className="flex gap-1 w-full">
                            <button type="button" onClick={() => handleReplacePhoto(i)} className="flex-1 py-1 bg-white/20 backdrop-blur-sm rounded text-[8px] font-bold text-white hover:bg-white/40">
                                Ganti
                            </button>
                            <button type="button" onClick={() => removePhotoDraft(i)} className="flex-1 py-1 bg-red-500 rounded text-[8px] font-bold text-white hover:bg-red-600">
                                Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {draftPhotos.length < 12 && (
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-outline/20 flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:bg-surface-container-low hover:border-primary/40 transition-all active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-[8px] font-bold uppercase tracking-wider opacity-60">Foto</span>
                    </button>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleAddPhotos} multiple accept="image/*" className="hidden" />
                <input type="file" ref={replaceInputRef} onChange={onReplaceFilePicked} accept="image/*" className="hidden" />
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold ml-1">
                    Nama Ruangan
                  </Label>
                  <Input name="nama" required defaultValue={editingSpace?.nama} placeholder="Contoh: Meeting Room A" className="rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 h-11 text-sm font-medium" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold ml-1">
                    Tipe Ruangan
                  </Label>
                  <div className="relative">
                    <select name="tipe" defaultValue={editingSpace?.tipe || "HOT_DESK"} className="w-full h-11 px-4 bg-surface-container-low rounded-xl border-none text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
                      {TIPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40"><RefreshCcw className="w-4 h-4" /></div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold ml-1">
                  Deskripsi
                </Label>
                <textarea
                  name="deskripsi"
                  rows={4}
                  defaultValue={editingSpace?.deskripsi}
                  placeholder="Ceritakan tentang fasilitas dan keunggulan unit ini..."
                  className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 resize-none min-h-[100px]"
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold ml-1">
                    Lokasi / Gedung
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <Input name="lokasi" required defaultValue={editingSpace?.lokasi} placeholder="Gedung atau alamat spesifik" className="h-11 pl-10 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold ml-1">
                    Kota
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <Input name="kota" required defaultValue={editingSpace?.kota} placeholder="Nama kota" className="h-11 pl-10 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium" />
                  </div>
                </div>
              </div>

              {/* Pricing & Capacity */}
              <div className="bg-surface-container p-5 rounded-2xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold ml-1">
                      Harga / Hari
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                      <Input name="harga_per_hari" type="number" required defaultValue={editingSpace?.harga_per_hari} placeholder="0" className="h-11 pl-8 rounded-xl bg-white border-primary/10 focus:ring-2 focus:ring-primary/20 text-sm font-bold text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold ml-1">
                      Harga / Jam
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                      <Input name="harga_per_jam" type="number" defaultValue={editingSpace?.harga_per_jam} placeholder="0" className="h-11 pl-8 rounded-xl bg-white border-outline/10 focus:ring-2 focus:ring-primary/20 text-sm font-medium" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold ml-1">
                      Kapasitas (Pax)
                    </Label>
                    <div className="relative">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                      <Input name="kapasitas" type="number" required defaultValue={editingSpace?.kapasitas} placeholder="0" className="h-11 pl-10 rounded-xl bg-white border-outline/10 focus:ring-2 focus:ring-primary/20 text-sm font-medium font-mono" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-widest text-on-surface-variant flex items-center gap-2 font-bold px-1">
                  Fasilitas Unggulan
                </h3>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((a) => {
                    const isSelected = selectedAmenities.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          setSelectedAmenities((prev) =>
                            prev.includes(a.id) ? prev.filter((id) => id !== a.id) : [...prev, a.id]
                          );
                        }}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center gap-2 border shadow-sm",
                          isSelected
                            ? "bg-primary border-primary text-white shadow-primary/20"
                            : "bg-surface-container-low border-outline/10 text-on-surface-variant hover:bg-surface-container"
                        )}
                      >
                        <div className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-white" : "bg-outline/30")} />
                        {a.nama}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {error && (
              <div className="mx-6 mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="p-6 border-t border-outline/10 bg-surface-container-lowest flex gap-3 shrink-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1 h-11 rounded-xl font-bold text-sm"
              disabled={loading}
            >
              Batal
            </Button>
            <Button 
              onClick={(e) => {
                e.preventDefault();
                const form = (e.currentTarget.closest('.fixed') as HTMLElement)?.querySelector('form');
                if (form) form.requestSubmit();
              }}
              disabled={loading} 
              className="flex-1 h-11 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              {loading ? (
                 <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                 </div>
              ) : (
                editingSpace ? "Update Unit" : "Publikasikan"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
