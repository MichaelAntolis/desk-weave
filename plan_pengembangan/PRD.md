# 📄 Product Requirements Document (PRD) - Versi MVP
**Proyek:** Sistem Manajemen & Pemesanan Coworking Space
**Platform:** Web Application (Responsive/Mobile-First)
**Nama website:** DeskWeave

## 1. Ringkasan Proyek
Sebuah platform *marketplace* dan manajemen *coworking space* yang mempertemukan penyedia ruang kerja (Pemilik) dengan individu atau perusahaan (Penyewa). Sistem ini memungkinkan pencarian, pengecekan ketersediaan secara *real-time*, dan pemesanan dengan alur pembayaran transfer manual.

## 2. Target Pengguna (Multi-Role)
1. **Penyewa (User/Renter):** Mencari, memesan meja/ruangan, dan mengunggah bukti pembayaran.
2. **Pemilik Tempat (Admin/Owner):** Mengelola ketersediaan ruangan dan memverifikasi/menyetujui pembayaran secara manual.

## 3. Tumpukan Teknologi & UI/UX (Tech Stack)
* **Frontend & Framework:** Next.js (App Router) + React.js
* **Database:** PostgreSQL (supabase)
* **Autentikasi:** NextAuth.js atau Clerk
* **Penyimpanan File (File Storage):** Supabase Storage (Terkait pembaruan fitur: ini diperlukan untuk menyimpan gambar ruangan dan foto bukti transfer pengguna).
* **Library UI/UX Modern:**
    * **Tailwind CSS & Shadcn UI:** Untuk antarmuka modern, *accessible*, dan *clean*.
    * **React-Day-Picker / FullCalendar:** Untuk fitur kalender interaktif.
    * **React Hook Form + Zod:** Untuk manajemen *form* (terutama *form* unggah bukti transfer).
    * **Lucide React:** Untuk aset ikon.

## 4. Kebutuhan Sistem Utama (System Requirements)
* **Manajemen Sesi:** Akses hak (*authorization*) berbeda antara Penyewa dan Pemilik.
* **Konkurensi (Concurrency):** Mencegah *double-booking* pada ruangan dan waktu yang sama.
* **Alur Pembayaran Manual:** Status *booking* ditahan pada status `PENDING` hingga pengguna mengunggah bukti bayar, dan berubah ke `CONFIRMED` setelah disetujui Admin.

---

## 5. Arsitektur Halaman & Detail Fitur (Total 11 Halaman)

### A. Area Autentikasi
**1. Halaman Login & Register**
* **Fitur:** Form pendaftaran dan masuk (Email/Password). Terdapat pilihan peran: Penyewa atau Pemilik.

### B. Area Penyewa (User/Renter)
**2. Halaman Beranda (Homepage)**
* **Fitur:** *Search bar* utama, *Featured Spaces* (desain *card* Shadcn).

**3. Halaman Pencarian & Eksplorasi (Explore Page)**
* **Fitur:** Filter harga/fasilitas, *List View*, dan *Sorting*.

**4. Halaman Detail Tempat (Space Detail Page)**
* **Fitur:** Galeri foto, daftar fasilitas, aturan tempat.
* **Booking Widget:** Kalender interaktif untuk memilih slot ketersediaan, ringkasan harga, dan tombol "Pesan & Lanjut Bayar".

**5. Halaman *Checkout* & Pembayaran Manual (REVISI)**
* **Ringkasan Pemesanan:** Detail pemesanan dan total harga yang harus dibayar.
* **Instruksi Pembayaran:** Menampilkan nomor rekening bank milik Admin/Pemilik tempat.
* **Form Upload Bukti:** Form untuk mengunggah foto/*screenshot* bukti transfer (format JPG/PNG).
* **Alur:** Setelah diunggah, status pesanan menjadi `WAITING_FOR_VERIFICATION`.

**6. Dasbor Penyewa (User Dashboard)**
* **Pemesanan Saya:** Daftar tiket dengan status jelas (Menunggu Pembayaran, Menunggu Verifikasi Admin, Dikonfirmasi, Ditolak).
* **Aksi:** Tombol untuk membatalkan pesanan (jika belum dibayar) atau mengunggah ulang bukti bayar jika ditolak.

### C. Area Dasbor Pemilik (Owner/Admin)
**7. Dasbor Utama (Overview)**
* **Fitur:** Statistik total pendapatan (dari pesanan *Confirmed*), tingkat okupansi, dan daftar tugas (misal: "Ada 3 pembayaran menunggu verifikasi!").

**8. Halaman Manajemen Properti (My Spaces)**
* **Fitur:** Tabel properti, form CRUD (*Add, Edit, Delete*) ruangan dan fasilitas.

**9. Halaman Manajemen Ketersediaan (Availability/Calendar)**
* **Fitur:** *Master Calendar* untuk melihat kapan ruangan dipakai, kosong, atau diblokir.

**10. Halaman Manajemen Pesanan & Verifikasi (REVISI)**
* **Tabel Pemesanan:** Daftar pesanan masuk dengan filter status.
* **Aksi Verifikasi:** Tombol untuk membuka *Modal* (Shadcn UI Dialog) yang menampilkan foto bukti transfer dari penyewa.
* **Keputusan:** Admin memiliki tombol **Approve** (mengubah status menjadi `CONFIRMED`) atau **Reject** (mengubah status menjadi `CANCELLED` atau meminta *upload* ulang).

**11. Halaman Laporan Keuangan**
* **Fitur:** Tabel pencatatan transaksi sederhana dari pesanan yang sudah berstatus `CONFIRMED`.

---

## 6. Struktur Basis Data (Revisi Entity Relationship)
Terdapat penambahan *field* untuk mengakomodasi bukti pembayaran:
* `User` (id, nama, email, role: ADMIN/USER, password)
* `Space` (id, owner_id, nama, lokasi, deskripsi, harga_per_jam, kapasitas)
* `Amenity` (id, nama, ikon) -> *Many-to-Many* dengan `Space`
* `Booking` (id, space_id, user_id, tanggal_mulai, tanggal_selesai, total_harga, status: PENDING / WAITING_VERIFICATION / CONFIRMED / CANCELLED, **bukti_bayar_url**)
* `Review` (id, space_id, user_id, rating, komentar)