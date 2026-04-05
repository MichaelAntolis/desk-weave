"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    const siblingCount = 1; // Number of pages to show on each side of current page
    
    // Always show first page
    pages.push(1);

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 2);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages - 1);

    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 1;

    if (showLeftDots) {
      pages.push("ellipsis-left");
    }

    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      pages.push(i);
    }

    if (showRightDots) {
      pages.push("ellipsis-right");
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages.map((page, index) => {
      if (typeof page === "string") {
        return (
          <div key={`${page}-${index}`} className="w-8 h-8 flex items-center justify-center text-on-surface-variant">
            <MoreHorizontal className="w-4 h-4" />
          </div>
        );
      }

      return (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
            currentPage === page
              ? "bg-primary text-white shadow-md scale-110"
              : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
          }`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className="flex items-center justify-center gap-2 pt-6">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="rounded-lg px-3 gap-1 text-xs font-bold transition-all disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
        Sebelumnya
      </Button>
      
      <div className="flex items-center gap-1.5 px-2">
        {renderPageNumbers()}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="rounded-lg px-3 gap-1 text-xs font-bold transition-all disabled:opacity-50"
      >
        Selanjutnya
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
