import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Zap, Coffee, Users, ArrowRight, ShieldCheck, Star } from "lucide-react";
import { SpaceCard } from "@/components/custom/SpaceCard";
import { getFeaturedRuangan } from "@/lib/actions/ruangan";
import Link from "next/link";

export default async function Home() {
  const featuredSpaces = await getFeaturedRuangan(3);

  return (
    <div className="min-h-screen bg-surface flex flex-col pt-16">
      <Navbar />

      {/* Hero Section */}
      <section className="relative px-8 py-10 md:py-16 lg:py-20 w-full max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="z-10 max-w-2xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-on-surface tracking-tighter leading-[1.1] mb-6 font-headline">
              Arsitektur <span className="italic text-primary">Hari Kerja</span> Ideal Anda.
            </h1>
            <p className="text-lg text-on-surface-variant font-body mb-8 leading-relaxed max-w-lg">
              Temukan, pesan, dan kelola ruang kerja premium dengan pengalaman seamless. Dirancang untuk para profesional modern.
            </p>
            
            {/* Search Bar */}
            <form action="/explore" method="GET" className="bg-surface-container-lowest p-2 rounded-xl shadow-lg shadow-primary/5 flex items-center mb-8 border border-outline/10">
              <div className="px-4 text-on-surface-variant">
                <Search className="w-5 h-5" />
              </div>
              <Input 
                type="text"
                name="q"
                placeholder="Cari lokasi, nama ruang, atau fasilitas..." 
                className="border-none shadow-none focus-visible:ring-0 bg-transparent text-base h-12"
              />
              <Button type="submit" size="lg" className="rounded-lg gradient-primary h-12 px-8 font-bold font-headline">
                Cari Ruang
              </Button>
            </form>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider py-2 pr-2">Populer:</span>
              {["Quiet Zone", "High Speed WiFi", "Premium Coffee Bar"].map((tag) => (
                <Link
                  key={tag}
                  href={`/explore?q=${encodeURIComponent(tag)}`}
                  className="px-3 py-1.5 rounded-full border border-outline/20 text-xs font-semibold text-on-surface hover:border-secondary hover:text-secondary transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="relative z-10 w-full aspect-[4/3] lg:aspect-[6/5] xl:aspect-[4/3] rounded-3xl overflow-hidden bg-surface-container shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80" 
              alt="Premium Workspace" 
              className="w-full h-full object-cover"
            />
            {/* Floating Badge */}
            <div className="absolute top-8 right-8 glass-effect px-4 py-3 rounded-xl border border-white/20 shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <ShieldCheck className="text-white w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">Kurasi Unggulan</p>
                <p className="text-xs text-on-surface-variant">Tempat terbaik bulan ini</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="bg-surface-container py-24 border-y border-outline/10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: Zap,
                title: "Koneksi Ultra Cepat",
                desc: "Infrastruktur fiber optik memastikan produktivitas Anda tidak pernah terputus.",
                color: "text-amber-500",
                bg: "bg-amber-500/10"
              },
              {
                icon: Coffee,
                title: "Kopi Kualitas Premium",
                desc: "Akses ke artisan coffee bar di setiap lokasi premium kami.",
                color: "text-secondary",
                bg: "bg-secondary/10"
              },
              {
                icon: Users,
                title: "Komunitas Terkurasi",
                desc: "Bergabung dengan ribuan founders, nomad, dan kreator profesional.",
                color: "text-primary",
                bg: "bg-primary/10"
              }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-start">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.bg}`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold font-headline mb-3 text-on-surface">{feature.title}</h3>
                <p className="text-on-surface-variant leading-relaxed font-body">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Spaces */}
      <section className="py-24 max-w-7xl mx-auto px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-4">
              Ruang Kerja Pilihan
            </h2>
            <p className="text-on-surface-variant text-lg">Pilihan terbaik untuk hari kerja Anda minggu ini.</p>
          </div>
          <Link href="/explore">
            <Button variant="outline" className="shrink-0 group font-bold tracking-tight">
              LIHAT SEMUA RUANG
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredSpaces.length > 0 ? (
            featuredSpaces.map((space) => (
              <SpaceCard
                key={space.id}
                id={space.id}
                name={space.nama}
                location={`${space.lokasi} • ${space.kota}`}
                price={space.harga_per_hari}
                priceType="/hari"
                rating={Number(space.rata_rata_rating) || 0}
                image={space.foto_utama || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"}
                tags={space.tipe ? [space.tipe.replace(/_/g, " ")] : []}
                features={[]}
              />
            ))
          ) : (
            // Fallback when no data in DB yet
            <div className="col-span-3 text-center py-16">
              <p className="text-on-surface-variant text-lg mb-4">Belum ada ruang kerja tersedia.</p>
              <p className="text-on-surface-variant text-sm">Daftar sebagai pemilik untuk menambahkan ruang kerja pertama!</p>
            </div>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-surface max-w-7xl mx-auto px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden order-2 lg:order-1 hidden md:block">
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&q=80" 
              alt="How it works" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <span className="text-secondary font-label font-bold uppercase tracking-widest mb-4 block">Alur Kerja</span>
            <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-10">
              Mulai Dalam Hitungan Detik
            </h2>
            
            <div className="space-y-8">
              {[
                { step: "01", title: "Cari Lokasi", desc: "Tentukan lokasi ideal berdasarkan preferensi fasilitas dan jarak Anda." },
                { step: "02", title: "Pesan Instan", desc: "Sistem booking real-time tanpa konfirmasi berbelit." },
                { step: "03", title: "Mulai Bekerja", desc: "Check-in digital dan nikmati pengalaman kerja hari itu." },
              ].map((item, i) => (
                <div key={i} className="flex gap-6">
                  <div className="text-3xl font-black text-outline/30 font-headline mt-1">{item.step}</div>
                  <div>
                    <h3 className="text-xl font-bold font-headline mb-2 text-on-surface">{item.title}</h3>
                    <p className="text-on-surface-variant font-body">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/explore">
              <Button size="lg" className="mt-10 rounded-lg gradient-primary font-bold font-headline px-8">
                Coba Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-extrabold font-headline tracking-tight mb-4">
              Apa yang Dikatakan Para Digital Nomad.
            </h2>
            <p className="text-primary-foreground/70">Ribuan profesional telah menemukan ruang kerja ideal mereka melalui DeskWeave.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: `"Sejak menggunakan DeskWeave, hari kerja saya lebih terstruktur. Pilihan tempatnya selalu estetik dan kopinya tidak pernah gagal!"`, name: "Lestari", role: "UI Designer", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" },
              { text: `"Saya telah mencoba berbagai coworking space, fitur booking real-time DeskWeave adalah game-changer untuk saya yang mobile."`, name: "Bimo Prakoso", role: "Software Engineer", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" },
              { text: `"Sebagai host, aplikasi ini memberikan dashboard yang sangat jelas. Occupancy rate saya naik 40% dalam sebulan pertama."`, name: "Amanda", role: "Space Owner", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80" }
            ].map((review, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/10 flex flex-col h-full">
                <div className="flex gap-1 mb-6 text-amber-400">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-lg leading-relaxed mb-8 flex-grow font-body italic text-white/90">{review.text}</p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                    <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold font-headline">{review.name}</h4>
                    <p className="text-xs text-primary-foreground/70">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 max-w-3xl mx-auto px-8 text-center">
        <span className="text-secondary font-label font-bold uppercase tracking-widest mb-4 block">Akses Eksklusif</span>
        <h2 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface mb-6">
          Kurasi ruang kerja global di inbox Anda.
        </h2>
        
        <div className="flex justify-center -space-x-4 mb-8">
          {["1500648767791-00dcc994a43e", "1494790108377-be9c29b29330", "1544005313-94ddf0286df2", "1507003211169-0a1dd7228f2d"].map((id, i) => (
            <img key={i} src={`https://images.unsplash.com/photo-${id}?w=100&q=80`} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-surface object-cover shadow-sm" />
          ))}
          <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center text-xs font-bold text-on-surface-variant shadow-sm z-10">
            +5k
          </div>
        </div>
        
        <p className="text-on-surface-variant mb-10 font-body">Bergabung dengan 24,000+ arsitek meja depan kami.</p>

        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input 
            type="email" 
            placeholder="Masukkan email Anda" 
            className="h-12 bg-surface-container-lowest border-outline/20 focus-visible:ring-secondary"
          />
          <Button size="lg" className="h-12 font-bold font-headline">Langganan</Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
