"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SpaceCard } from "@/components/custom/SpaceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, X, ChevronDown, Loader2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { getRuanganList, getFasilitas } from "@/lib/actions/ruangan";
import type { Fasilitas, TipeRuangan } from "@/lib/types/database";
import { useSearchParams } from "next/navigation";

type SortOption = "recommended" | "price-low" | "price-high" | "top-rated";

const WORKSPACE_TYPES: { label: string; value: TipeRuangan | "" }[] = [
  { label: "All Types", value: "" },
  { label: "Hot Desk", value: "HOT_DESK" },
  { label: "Dedicated Desk", value: "DEDICATED_DESK" },
  { label: "Private Office", value: "PRIVATE_OFFICE" },
  { label: "Meeting Room", value: "MEETING_ROOM" },
  { label: "Event Space", value: "EVENT_SPACE" },
  { label: "Virtual Office", value: "VIRTUAL_OFFICE" },
];

export default function ExplorePage() {
  return (
    <Suspense>
      <ExploreContent />
    </Suspense>
  );
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [workspaceType, setWorkspaceType] = useState<TipeRuangan | "">("");

  const [spaces, setSpaces] = useState<Awaited<ReturnType<typeof getRuanganList>>["data"]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [amenities, setAmenities] = useState<Fasilitas[]>([]);

  const ITEMS_PER_PAGE = 9;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  // Fetch amenities on mount
  useEffect(() => {
    getFasilitas().then(setAmenities);
  }, []);

  // Fetch spaces on filter change
  const fetchSpaces = useCallback(async () => {
    setLoading(true);
    const result = await getRuanganList({
      search: searchQuery || undefined,
      tipe: workspaceType || undefined,
      minHarga: priceMin ? Number(priceMin) : undefined,
      maxHarga: priceMax ? Number(priceMax) : undefined,
      sortBy,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    });
    setSpaces(result.data);
    setTotalCount(result.count);
    setLoading(false);
  }, [searchQuery, workspaceType, priceMin, priceMax, sortBy, currentPage]);

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  const clearFilters = () => {
    setPriceMin("");
    setPriceMax("");
    setSearchQuery("");
    setWorkspaceType("");
    setCurrentPage(1);
  };

  // Filter Sidebar Component
  const FilterContent = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-headline font-bold text-lg text-primary">Filters</h2>
        <button
          onClick={clearFilters}
          className="text-secondary text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
        >
          Clear All
        </button>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <label className="block text-on-surface-variant font-label text-sm font-semibold uppercase tracking-wider">
          Price Range (IDR)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-[10px] text-outline uppercase font-bold">Min</span>
            <Input
              type="number"
              placeholder="0"
              value={priceMin}
              onChange={(e) => { setPriceMin(e.target.value); setCurrentPage(1); }}
              className="bg-surface-container-low border-none text-sm"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-outline uppercase font-bold">Max</span>
            <Input
              type="number"
              placeholder="2M+"
              value={priceMax}
              onChange={(e) => { setPriceMax(e.target.value); setCurrentPage(1); }}
              className="bg-surface-container-low border-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Workspace Type */}
      <div className="space-y-4">
        <label className="block text-on-surface-variant font-label text-sm font-semibold uppercase tracking-wider">
          Workspace Type
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full bg-surface-container-low border-none rounded-lg text-sm p-3 focus:ring-primary text-on-surface flex justify-between items-center outline-none hover:bg-surface-container transition-colors">
            {WORKSPACE_TYPES.find(t => t.value === workspaceType)?.label || "All Types"}
            <ChevronDown className="w-4 h-4 opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[85vw] sm:w-[272px] bg-surface-container-lowest border-outline/10 shadow-lg rounded-xl overflow-hidden p-1 z-[110]">
            {WORKSPACE_TYPES.map(type => (
              <DropdownMenuItem 
                key={type.value}
                onClick={() => { setWorkspaceType(type.value as TipeRuangan | ""); setCurrentPage(1); }}
                className="text-sm font-medium cursor-pointer py-2.5 rounded-lg focus:bg-primary/10 focus:text-primary outline-none"
              >
                {type.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Button 
        onClick={() => { fetchSpaces(); setShowMobileFilter(false); }}
        className="w-full py-3 gradient-primary text-white font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]"
      >
        Apply Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      <main className="pt-24 md:pt-28 min-h-screen">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-24 bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
              <FilterContent />
            </div>
          </aside>

          {/* Mobile Filter Overlay */}
          {showMobileFilter && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowMobileFilter(false)}
              />
              <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-surface rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-headline font-bold text-lg text-primary">Filters</h2>
                  <button onClick={() => setShowMobileFilter(false)} className="text-on-surface-variant">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterContent />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 space-y-8 pb-24">
            {/* Header, Search & Sorting */}
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-headline font-extrabold text-primary tracking-tight">
                  Eksplorasi Ruang Kerja
                </h1>
                <p className="text-on-surface-variant mt-2 text-sm md:text-base max-w-xl">
                  Temukan ruang kerja yang sesuai dengan gaya dan kebutuhan tim Anda. Saat ini menampilkan <strong className="text-primary">{totalCount}</strong> tempat terbaik.
                </p>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-container-lowest p-3 md:p-4 rounded-2xl shadow-sm border border-outline/10">
                {/* Search Bar */}
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5 pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Cari gedung, lokasi, atau kota..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="pl-12 pr-12 py-6 bg-surface-container-low border-none rounded-xl focus-visible:ring-primary w-full text-sm md:text-base font-medium shadow-inner"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-on-surface hover:bg-surface-container-high rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {/* Sort Dropdown */}
                <div className="flex items-center gap-3 bg-surface-container-low p-2 md:p-3 rounded-xl border border-outline/5 w-full md:w-auto justify-between md:justify-start shrink-0 min-w-[200px]">
                  <span className="text-xs font-bold text-outline px-3 uppercase tracking-widest whitespace-nowrap hidden sm:block">Sort By:</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer pr-4 outline-none flex items-center justify-between w-full sm:w-auto hover:opacity-80 transition-opacity">
                      {sortBy === "recommended" ? "Recommended" : sortBy === "price-low" ? "Price: Low to High" : sortBy === "price-high" ? "Price: High to Low" : "Top Rated"}
                      <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-full sm:w-56 bg-surface-container-lowest border-outline/10 shadow-lg rounded-xl overflow-hidden p-1 z-[110]">
                      <DropdownMenuItem onClick={() => { setSortBy("recommended"); setCurrentPage(1); }} className="text-sm font-medium cursor-pointer py-2.5 rounded-lg focus:bg-primary/10 focus:text-primary outline-none">Recommended</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSortBy("price-low"); setCurrentPage(1); }} className="text-sm font-medium cursor-pointer py-2.5 rounded-lg focus:bg-primary/10 focus:text-primary outline-none">Price: Low to High</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSortBy("price-high"); setCurrentPage(1); }} className="text-sm font-medium cursor-pointer py-2.5 rounded-lg focus:bg-primary/10 focus:text-primary outline-none">Price: High to Low</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSortBy("top-rated"); setCurrentPage(1); }} className="text-sm font-medium cursor-pointer py-2.5 rounded-lg focus:bg-primary/10 focus:text-primary outline-none">Top Rated</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : spaces.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {spaces.map((space) => (
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
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="w-64 h-64 relative">
                  <div className="absolute inset-0 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
                  <div className="relative flex items-center justify-center h-full">
                    <Search className="w-20 h-20 text-secondary/40" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-headline font-bold text-primary">
                    Wah, belum ada ruang kerja nih!
                  </h3>
                  <p className="text-on-surface-variant max-w-sm mx-auto">
                    Coba atur ulang filter kamu atau cari di lokasi lain yang lebih populer.
                  </p>
                </div>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="font-bold px-8"
                >
                  Reset Semua Filter
                </Button>
              </div>
            )}

            {/* Pagination */}
            {!loading && spaces.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-12">
                <button 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-low text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-40"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-all ${
                        currentPage === page
                          ? "bg-primary text-white"
                          : "bg-surface-container-low text-primary hover:bg-primary/10"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-low text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-40"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile FAB for filter */}
      <button
        onClick={() => setShowMobileFilter(true)}
        className="lg:hidden fixed bottom-8 right-8 w-14 h-14 bg-secondary text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-40"
      >
        <SlidersHorizontal className="w-5 h-5" />
      </button>

      <Footer />
    </div>
  );
}
