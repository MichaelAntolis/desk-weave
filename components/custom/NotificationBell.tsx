"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function NotificationBell({ baseUrl = "/owner" }: { baseUrl?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant focus:outline-none relative">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error border-2 border-white"></span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 bg-surface-container-lowest border-outline/10 shadow-2xl rounded-xl p-2 z-[100]">
        <div className="px-2 py-2 mb-1 border-b border-outline/5 flex justify-between items-center">
          <span className="font-bold text-sm text-primary">Notifications</span>
          <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">2 New</span>
        </div>
        
        {/* Mock Notifications */}
        <DropdownMenuItem className="text-xs p-3 rounded-lg focus:bg-primary/5 cursor-pointer flex flex-col items-start gap-1 mt-1">
          <span className="font-bold text-on-surface">Payment Verified</span>
          <span className="text-on-surface-variant line-clamp-2 leading-relaxed">Order #DW-9821 has been successfully manually verified by the tenant.</span>
          <span className="text-[10px] text-outline mt-1">2 hours ago</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="text-xs p-3 rounded-lg focus:bg-primary/5 cursor-pointer flex flex-col items-start gap-1">
          <span className="font-bold text-on-surface">New Broadcast</span>
          <span className="text-on-surface-variant line-clamp-2 leading-relaxed">System maintenance is scheduled for October 12th. Plan ahead.</span>
          <span className="text-[10px] text-outline mt-1">1 day ago</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-outline/5 my-1" />
        <DropdownMenuItem 
          onClick={() => window.location.href = `${baseUrl}/messages`}
          className="w-full justify-center py-2.5 text-xs font-bold text-primary focus:bg-primary/5 cursor-pointer flex rounded-b-lg"
        >
          View All in Inbox
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
