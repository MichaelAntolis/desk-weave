"use client";

import { User, Mail, Phone, Building, KeyRound, ShieldCheck, Loader2, Camera, UserCircle } from "lucide-react";
import { NotificationBell } from "@/components/custom/NotificationBell";
import { ProfileMenu } from "@/components/custom/ProfileMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/AuthProvider";
import { updateProfile, uploadAvatar, deleteAvatar } from "@/lib/actions/auth";
import { useState, useRef } from "react";
import { DashboardHeader } from "@/components/custom/DashboardHeader";
import { cn } from "@/lib/utils";

export default function TenantProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = profile?.nama_lengkap || "Tenant";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("avatar", file);

    const result = await uploadAvatar(formData);
    if (result.error) {
      setError(result.error);
    } else {
      refreshProfile?.();
    }
    setUploading(false);
  };

  const handleRemoveAvatar = async () => {
    if (!confirm("Hapus foto profil?")) return;
    setRemoving(true);
    const result = await deleteAvatar();
    if (result.success) {
      refreshProfile?.();
    }
    setRemoving(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      refreshProfile?.();
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      <DashboardHeader 
        title="Profil Pengguna" 
        role="TENANT" 
        subtitle="Manage Account" 
      />

      <section className="px-4 md:px-8 py-6 md:py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20 md:pb-0 font-body">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 border border-outline/10 shadow-sm text-center relative overflow-hidden group">
              <div className="relative z-10">
                 <div className="w-28 h-28 mx-auto rounded-[2.5rem] bg-surface-container flex items-center justify-center mb-6 relative cursor-pointer overflow-hidden ring-4 ring-primary/5 shadow-2xl transition-all hover:scale-105 active:scale-95 group/avatar" onClick={() => fileInputRef.current?.click()}>
                   {uploading ? (
                     <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                     </div>
                   ) : (
                     <div className="absolute inset-0 bg-black/0 group-hover/avatar:bg-black/40 transition-colors flex items-center justify-center z-10">
                        <Camera className="w-8 h-8 text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                     </div>
                   )}
                   {profile?.avatar_url ? (
                     <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-4xl font-black text-primary font-headline">{initials}</span>
                   )}
                 </div>
                 <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                 
                 {profile?.avatar_url && (
                    <button 
                      type="button" 
                      onClick={handleRemoveAvatar} 
                      disabled={removing}
                      className="text-[10px] font-black uppercase text-red-500 hover:text-red-600 tracking-widest mt-[-1rem] mb-4 block mx-auto transition-colors disabled:opacity-50"
                    >
                      {removing ? "Removing..." : "Remove Photo"}
                    </button>
                 )}

                 <h3 className="text-2xl font-black font-headline text-on-surface">{displayName}</h3>
                 <p className="text-on-surface-variant text-sm font-medium mt-1">{profile?.email}</p>
                 <div className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 bg-secondary/10 text-secondary rounded-2xl border border-secondary/20 shadow-sm">
                   <ShieldCheck className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Tenant</span>
                 </div>
              </div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 translate-y-1/2 -translate-x-1/2 rounded-full" />
            </div>

            <div className="bg-surface-container-lowest rounded-[2rem] p-8 border border-outline/10 shadow-sm space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant"><User className="w-5 h-5" /></div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black mb-0.5">Account Role</p>
                  <p className="font-bold text-on-surface uppercase tracking-tight">{profile?.peran || "Tenant"}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant"><Phone className="w-5 h-5" /></div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black mb-0.5">Telepon</p>
                  <p className="font-bold text-on-surface">{profile?.nomor_telepon || "Private"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-container-lowest rounded-[3rem] p-8 md:p-10 border border-outline/10 shadow-sm">
              <div className="flex items-center gap-4 border-b border-outline/5 pb-6 mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary"><UserCircle className="w-6 h-6" /></div>
                 <h3 className="text-xl font-black font-headline text-on-surface tracking-tight">Informasi Personal</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-on-surface-variant font-label uppercase tracking-[0.2em] px-1">Nama Lengkap</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline group-focus-within:text-primary transition-colors" />
                      <Input name="nama_lengkap" defaultValue={profile?.nama_lengkap || ""} className="h-14 pl-12 rounded-2xl bg-surface-container-low border-none shadow-inner font-bold focus:ring-2 focus:ring-primary/20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-on-surface-variant font-label uppercase tracking-[0.2em] px-1">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                      <Input defaultValue={profile?.email || ""} type="email" disabled className="h-14 pl-12 rounded-2xl bg-surface-container-low border-none opacity-60 font-bold" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-on-surface-variant font-label uppercase tracking-[0.2em] px-1">Nomor Telepon / WhatsApp</Label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline group-focus-within:text-primary transition-colors" />
                      <Input name="nomor_telepon" defaultValue={profile?.nomor_telepon || ""} type="tel" className="h-14 pl-12 rounded-2xl bg-surface-container-low border-none shadow-inner font-bold focus:ring-2 focus:ring-primary/20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-on-surface-variant font-label uppercase tracking-[0.2em] px-1">Instansi / Perusahaan</Label>
                    <div className="relative group">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline group-focus-within:text-primary transition-colors" />
                      <Input name="nama_bisnis" defaultValue={profile?.nama_bisnis || ""} className="h-14 pl-12 rounded-2xl bg-surface-container-low border-none shadow-inner font-bold focus:ring-2 focus:ring-primary/20" />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border-2 border-red-500/20 rounded-2xl text-red-600 text-sm font-bold animate-shake">{error}</div>
                )}
                {success && (
                  <div className="p-4 bg-green-500/10 border-2 border-green-500/20 rounded-2xl text-green-600 text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                     <ShieldCheck className="w-4 h-4" /> Profil Anda telah diperbarui!
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={saving} className="h-14 px-10 rounded-2xl gradient-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all">
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-3" /> Processing</> : "Update Profil"}
                  </Button>
                </div>
              </form>
            </div>

            <div className="bg-surface-container-lowest rounded-[3rem] p-8 md:p-10 border border-outline/10 shadow-sm relative overflow-hidden">
               <div className="flex items-center gap-4 border-b border-outline/5 pb-6 mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><KeyRound className="w-6 h-6" /></div>
                 <h3 className="text-xl font-black font-headline text-on-surface tracking-tight">Kredensial Akun</h3>
              </div>
              <form className="space-y-8 relative z-10">
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-on-surface-variant font-label uppercase tracking-[0.2em] px-1">Ganti Password</Label>
                    <div className="relative group">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline group-focus-within:text-primary transition-colors" />
                      <Input type="password" placeholder="••••••••" className="h-14 pl-12 rounded-2xl bg-surface-container-low border-none shadow-inner font-bold focus:ring-2 focus:ring-primary/20" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-start pt-4">
                  <Button type="button" variant="outline" className="h-14 px-8 rounded-2xl border-2 border-primary/10 text-primary hover:bg-primary/5 font-black text-xs uppercase tracking-widest active:scale-95 transition-all">
                    Reset Password
                  </Button>
                </div>
              </form>
              <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/[0.03] -translate-y-1/2 translate-x-1/2 rounded-full" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
