# 🏁 Deskweave — Modern Workspace Architecture

Deskweave adalah platform *workspace marketplace* mutakhir yang menjembatani pemilik ruang kerja premium dengan para profesional modern, digital nomad, dan tim remote. Platform ini dirancang untuk memberikan pengalaman "Arsitektur Hari Kerja" yang seamless, terkurasi, dan efisien.

---

## 🚀 Fitur Utama

### **1. Discovery & Exploration**
*   **Grid-based Search Engine:** Menemukan ruang kerja berdasarkan lokasi, kota, atau nama gedung.
*   **Advanced Filtering:** Filter mendalam berdasarkan tipe ruangan (Hot Desk, Private Office, Meeting Room, dll), range harga, dan rating.
*   **Sorting System:** Urutkan berdasarkan rekomendasi, harga terendah/tertinggi, dan rating terbaik.

### **2. Booking & Management**
*   **Real-time Availability:** Cek ketersediaan ruangan secara instan.
*   **Overlap Prevention:** Logika cerdas untuk mencegah *double-booking* pada slot waktu yang sama.
*   **Maintenance Blocking:** Owner dapat memblokir tanggal tertentu untuk keperluan perawatan atau acara internal.

### **3. Transaction & Payment (Manual Verification)**
*   **Secure Upload Proof:** Alur pembayaran aman dengan mengunggah bukti transfer langsung ke platform.
*   **Verification Workflow:** Owner melakukan validasi manual terhadap bukti pembayaran sebelum konfirmasi reservasi.
*   **Automatic Status Updates:** Notifikasi status mulai dari *Pending*, *Menunggu Verifikasi*, hingga *Dikonfirmasi*.

### **4. Owner Dashboard & Analytics**
*   **Financial Matrix:** Pantau total pendapatan dan performa keuangan.
*   **Occupancy Insights:** Lihat tingkat keterisian ruang kerja secara real-time.
*   **Calendar View:** Kelola reservasi harian melalui widget kalender yang interaktif.
*   **Space Management:** CRUD (Create, Read, Update, Delete) data ruangan dan fasilitas dengan mudah.

### **5. Tenant Experience**
*   **Personal Profile:** Kelola data diri dan riwayat pemesanan.
*   **Booking History:** Pantau status pesanan aktif maupun yang sudah selesai.
*   **Actionable Bookings:** Opsional pembatalan untuk pesanan yang masih berstatus pending.

---

## 🛠️ Stack Teknologi

*   **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (Custom Color Tokens)
*   **Backend & DB:** [Supabase](https://supabase.com/) (PostgreSQL + RLS)
*   **Storage:** Supabase Storage (Bukti Pembayaran & Foto Ruangan)
*   **Icons:** Lucide React
*   **UI Components:** Shadcn UI (Customized)

---

## 📦 Struktur Proyek

```text
├── app/                  # Route handlers & UI Pages
│   ├── (auth)/          # Authentication flows
│   ├── owner/           # Owner-specific dashboards
│   ├── tenant/          # Tenant-specific profiles & bookings
│   ├── explore/         # Workspace discovery grid
│   └── space/           # Detailed space information
├── components/          # Reusable UI components
│   ├── custom/          # Project-specific complex components (Calendar, Cards)
│   ├── layout/          # Navigation & Footer
│   └── ui/              # Atom components (Shadcn based)
├── lib/                 # Shared logic & utilities
│   ├── actions/         # Server Actions (DB Queries & Mutations)
│   ├── types/           # TypeScript definitions
│   └── supabase/        # Database clients
└── public/              # Static assets
```

---

## 🛠️ Cara Menjalankan

1.  **Clone repositori:**
    ```bash
    git clone [url-repo]
    ```

2.  **Install dependensi:**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**
    Salalin `.env.example` menjadi `.env.local` dan isi kredensial Supabase Anda:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your-project-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    ```

4.  **Jalankan server pengembangan:**
    ```bash
    npm run dev
    ```

5.  Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

