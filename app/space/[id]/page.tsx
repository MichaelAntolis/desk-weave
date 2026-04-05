import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getRuanganById, getUlasanByRuangan } from "@/lib/actions/ruangan";
import { getUser } from "@/lib/actions/auth";
import { getBlockedDates } from "@/lib/actions/pemesanan";
import { MapPin, Users, Star, Wifi, ArrowLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SpaceBookingWidget } from "./SpaceBookingWidget";

interface SpaceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SpaceDetailPage({ params }: SpaceDetailPageProps) {
  const { id } = await params;
  const space = await getRuanganById(id);

  if (!space) {
    notFound();
  }

  const [ulasan, user, blockedDates] = await Promise.all([
    getUlasanByRuangan(id),
    getUser(),
    getBlockedDates(id)
  ]);

  const photos = space.foto_ruangan && space.foto_ruangan.length > 0
    ? space.foto_ruangan.map((f: { url: string }) => f.url)
    : [
        space.foto_utama || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
      ];

  const facilities = (space.fasilitas || []) as { id: string; nama: string; ikon: string }[];

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      <main className="pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto w-full flex-1">
        {/* Back Button */}
        <Link href="/explore" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6 text-sm font-body">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Explore
        </Link>

        {/* High-Fidelity Photo Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl h-[400px] md:h-[550px] relative">
           {/* Left main image (Spans 2 columns) */}
           <div className="md:col-span-2 relative group overflow-hidden bg-surface-container">
              <img
                src={photos[0] || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80"}
                alt={space.nama}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
           </div>
           
           {/* Right grid (4 smaller slots) */}
           <div className="md:col-span-2 grid grid-cols-2 gap-4 h-full">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="relative group overflow-hidden bg-surface-container-low">
                   {photos[i] ? (
                      <img
                        src={photos[i]}
                        alt={`${space.nama} view ${i}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                   ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/20 bg-surface-container-lowest border-2 border-dashed border-outline/5 rounded-2xl m-2 box-border">
                         <ImageIcon className="w-8 h-8 mb-2 opacity-5" />
                         <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">More Visuals Coming</span>
                      </div>
                   )}
                   <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Meta */}
            <div>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant uppercase tracking-widest font-label mb-2">
                <span>{space.tipe?.replace(/_/g, " ")}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-primary font-bold">{space.kota}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-headline text-on-surface tracking-tight mb-4">
                {space.nama}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-on-surface-variant text-sm">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> {space.lokasi}{space.alamat_lengkap ? `, ${space.alamat_lengkap}` : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Kapasitas {space.kapasitas} orang
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {space.rata_rata_rating || 0} ({space.jumlah_ulasan || 0} ulasan)
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline/10">
              <h3 className="text-lg font-bold font-headline text-primary mb-4">Deskripsi</h3>
              <p className="text-on-surface-variant leading-relaxed font-body whitespace-pre-line">
                {space.deskripsi || "Ruang kerja premium dengan fasilitas lengkap untuk produktivitas maksimal Anda."}
              </p>
            </div>

            {/* Facilities */}
            {facilities.length > 0 && (
              <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline/10">
                <h3 className="text-lg font-bold font-headline text-primary mb-4">Fasilitas</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {facilities.map((f) => (
                    <div key={f.id} className="flex items-center gap-3 text-on-surface text-sm font-body">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <Wifi className="w-5 h-5" />
                      </div>
                      {f.nama}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Owner Info */}
            {space.pemilik && (
              <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline/10">
                <h3 className="text-lg font-bold font-headline text-primary mb-4">Pemilik</h3>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                    {space.pemilik.nama_lengkap?.charAt(0)?.toUpperCase() || "O"}
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">{space.pemilik.nama_lengkap || "Owner"}</h4>
                    {space.pemilik.nama_bisnis && (
                      <p className="text-sm text-on-surface-variant">{space.pemilik.nama_bisnis}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline/10">
              <h3 className="text-lg font-bold font-headline text-primary mb-4">
                Ulasan ({space.jumlah_ulasan || 0})
              </h3>
              {ulasan.length > 0 ? (
                <div className="space-y-6">
                  {ulasan.map((review) => (
                    <div key={review.id} className="border-b border-outline/10 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center overflow-hidden">
                          {review.penyewa?.avatar_url ? (
                            <img src={review.penyewa.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-primary">
                              {review.penyewa?.nama_lengkap?.charAt(0) || "U"}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-on-surface">{review.penyewa?.nama_lengkap || "Pengguna"}</p>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "text-amber-400 fill-amber-400" : "text-outline/30"}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-on-surface-variant">{review.komentar}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-on-surface-variant text-sm">Belum ada ulasan untuk ruang kerja ini.</p>
              )}
            </div>
          </div>

          {/* Right Column: Booking Widget */}
          <div className="lg:col-span-1">
            <SpaceBookingWidget
              spaceId={space.id}
              spaceName={space.nama}
              hargaPerHari={space.harga_per_hari}
              hargaPerJam={space.harga_per_jam}
              isLoggedIn={!!user}
              pemilikId={space.pemilik_id}
              blockedDates={blockedDates}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
