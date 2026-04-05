"use client";

import { Heart, MapPin, Wifi, Users, Star } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatRupiah, cn } from "@/lib/utils";

interface SpaceCardProps {
  id: string;
  name: string;
  location: string;
  price: number;
  priceType: string;
  rating: number;
  image: string;
  tags: string[];
  features?: string[];
}

export function SpaceCard({ id, name, location, price, priceType, rating, image, tags, features = [] }: SpaceCardProps) {
  return (
    <div className="group relative rounded-2xl bg-surface-container-lowest transition-all duration-300 hover:shadow-primary/5 hover:scale-[1.01] overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {features.includes("LIVE NOW") && (
            <Badge className="bg-secondary/90 hover:bg-secondary text-white font-label font-bold text-[10px] tracking-wider px-2 py-0.5 rounded-sm">
              LIVE NOW
            </Badge>
          )}
          {features.includes("POPULAR") && (
            <Badge className="bg-primary/90 hover:bg-primary text-white font-label font-bold text-[10px] tracking-wider px-2 py-0.5 rounded-sm">
              POPULAR
            </Badge>
          )}
          {features.includes("PREMIUM CHOICE") && (
            <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-label font-bold text-[10px] tracking-wider px-2 py-0.5 rounded-sm border-none">
              PREMIUM CHOICE
            </Badge>
          )}
        </div>
        {/* Favorite Button */}
        <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-colors">
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-headline font-bold text-lg text-on-surface line-clamp-1">{name}</h3>
          <div className="flex items-center gap-1 shrink-0 bg-surface-container px-2 py-0.5 rounded-md">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-on-surface">{rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-on-surface-variant text-sm mb-4">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] uppercase tracking-wider font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer: Price & CTA */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline/10">
          <div>
            <span className="text-xs text-on-surface-variant block mb-0.5">Mulai dari</span>
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-primary">{formatRupiah(price)}</span>
              <span className="text-xs text-on-surface-variant">{priceType}</span>
            </div>
          </div>
          <Link href={`/space/${id}`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 rounded-full bg-surface-container hover:bg-secondary hover:text-white transition-colors")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
