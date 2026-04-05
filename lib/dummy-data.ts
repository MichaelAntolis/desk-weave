export const SPACES = [
  {
    id: "sp-1",
    name: "The Obsidian Studio",
    location: "Creative District • London",
    city: "London",
    price: 450000,
    priceType: "/hari",
    capacity: "Hingga 12 Orang",
    rating: 4.9,
    reviews: 128,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    tags: ["QUIET ZONE"],
    facilities: [
      { name: "1 Gbps Fiber", icon: "wifi" },
      { name: "Herman Miller Embody", icon: "chair" },
    ],
    features: ["PREMIUM CHOICE", "LIVE NOW"]
  },
  {
    id: "sp-2",
    name: "Zen Executive Suite",
    location: "DOWNTOWN • SINGAPORE",
    city: "Singapore",
    price: 600000,
    priceType: "/hari",
    capacity: "Hingga 5 Orang",
    rating: 4.9,
    reviews: 84,
    image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800&q=80",
    tags: ["MEETING ROOMS"],
    facilities: [
      { name: "Whiteboard", icon: "presentation" }
    ],
    features: []
  },
  {
    id: "sp-3",
    name: "The Loft Lounge",
    location: "SOHO • NEW YORK",
    city: "New York",
    price: 300000,
    priceType: "/hari",
    capacity: "Open Desks",
    rating: 4.7,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&q=80",
    tags: ["COFFEE BAR", "NETWORKING"],
    facilities: [
      { name: "Espresso Machine", icon: "coffee" }
    ],
    features: []
  },
  {
    id: "sp-4",
    name: "The Arch Hub Jakarta",
    location: "SCBD • Jakarta",
    city: "Jakarta",
    price: 150000,
    priceType: "/hari",
    capacity: "Hot Desking",
    rating: 4.9,
    reviews: 450,
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
    tags: ["QUIET ZONE", "BARISTA"],
    facilities: [
      { name: "High-Speed WiFi", icon: "wifi" }
    ],
    features: ["LIVE NOW"]
  },
  {
    id: "sp-5",
    name: "Green Loft Kemang",
    location: "Kemang • Jakarta Selatan",
    city: "Jakarta",
    price: 120000,
    priceType: "/hari",
    capacity: "Hot Desking",
    rating: 4.7,
    reviews: 130,
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80",
    tags: ["PET FRIENDLY", "FIBER OPTIC"],
    facilities: [
      { name: "Garden Setup", icon: "leaf" }
    ],
    features: []
  },
  {
    id: "sp-6",
    name: "Silicon Suite Kuningan",
    location: "Kuningan • Jakarta",
    city: "Jakarta",
    price: 200000,
    priceType: "/hari",
    capacity: "Dedicated Desks",
    rating: 4.8,
    reviews: 320,
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
    tags: ["24/7 ACCESS", "GYM ACCESS"],
    facilities: [
      { name: "24/7 Building Access", icon: "key" }
    ],
    features: ["POPULAR"]
  }
];

export const AMENITIES = [
  "High-Speed WiFi",
  "Coffee Bar",
  "Meeting Rooms",
  "Quiet Zone",
  "Parking Space"
];

export const BOOKINGS = [
  {
    id: "BK-9821",
    workspace: "Skyline Suite 402",
    date: "12 Okt 2024",
    amount: 1250000,
    status: "Pending",
    tenant: {
      name: "Alex Rivers",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80"
    }
  },
  {
    id: "BK-9755",
    workspace: "Co-Working HotDesk",
    date: "11 Okt 2024",
    amount: 150000,
    status: "Success",
    tenant: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80"
    }
  },
  {
    id: "BK-9742",
    workspace: "Premium Studio B",
    date: "10 Okt 2024",
    amount: 5400000,
    status: "Pending",
    tenant: {
      name: "Marcus Thorne",
      avatar: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=100&q=80"
    }
  }
];

export const TENANT_BOOKINGS = [
  {
    id: "TB-01",
    space: "Elite Executive Suite - Sudirman Central",
    location: "Jakarta Selatan, Indonesia",
    date: "24 Okt - 26 Okt 2024",
    amount: 1250000,
    status: "CONFIRMED",
    image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800&q=80"
  },
  {
    id: "TB-02",
    space: "Creative Sandbox - Studio B",
    location: "Bandung, West Java",
    date: "12 Nov 2024",
    amount: 450000,
    status: "PENDING",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80"
  },
  {
    id: "TB-03",
    space: "Boardroom Alpha - Mega Kuningan",
    location: "Jakarta Selatan",
    date: "10 Okt 2024",
    amount: 850000,
    status: "COMPLETED",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
  }
];

export const MY_SPACES = [
  {
    id: "ms-1",
    name: "Lumina Glass Office",
    type: "Private Studio • 4-6 People",
    location: "Jakarta, SCBD",
    address: "The Energy Building, 12th Floor",
    status: "LIVE NOW",
    price: 450,
    priceCurency: "USD",
    priceRp: 7000000,
    image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800&q=80"
  },
  {
    id: "ms-2",
    name: "The Brickhouse",
    type: "Open Desks • 20 Units",
    location: "Bandung, Dago",
    address: "Jl. Ir. H. Juanda No. 88",
    status: "LIVE NOW",
    price: 15,
    priceCurency: "USD",
    priceRp: 230000,
    image: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&q=80"
  }
];

export const TRANSACTIONS = [
  {
    id: "INV-2023-0891",
    name: "Private Studio A-12",
    client: "Budi Santoso",
    date: "12 Okt 2023",
    status: "Confirmed",
    amount: 2450000,
  },
  {
    id: "INV-2023-0892",
    name: "Hot Desk Weekly Pass",
    client: "Siska Amelia",
    date: "11 Okt 2023",
    status: "Confirmed",
    amount: 850000,
  },
  {
    id: "INV-2023-0893",
    name: "Meeting Room Sapphire",
    client: "PT Teknologi Maju",
    date: "10 Okt 2023",
    status: "Confirmed",
    amount: 1200000,
  },
  {
    id: "INV-2023-0894",
    name: "Virtual Office Bronze",
    client: "Andi Wijaya",
    date: "09 Okt 2023",
    status: "Confirmed",
    amount: 4500000,
  }
];
