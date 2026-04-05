"use client";

import { useState } from "react";
import { Search, ChevronLeft, MoreVertical, Send, Paperclip, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { NotificationBell } from "@/components/custom/NotificationBell";
import { ProfileMenu } from "@/components/custom/ProfileMenu";

const THREADS = [
  {
    id: 1,
    name: "Owner (Budi Santoso)",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    lastMsg: "Hi! Received. I will verify it right now and update your status.",
    time: "10:41 AM",
    unread: 1,
    online: true,
  },
  {
    id: 2,
    name: "System Notifications",
    avatar: "https://ui-avatars.com/api/?name=System&background=00236f&color=fff",
    lastMsg: "Your payment for Order #DW-9821 has been verified.",
    time: "Yesterday",
    unread: 0,
    online: false,
  }
];

import { DashboardHeader } from "@/components/custom/DashboardHeader";

export default function TenantMessagesPage() {
  const [activeThread, setActiveThread] = useState<number | null>(1);
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);

  const handleThreadSelect = (id: number) => {
    setActiveThread(id);
    setIsMobileListOpen(false);
  };

  const activeData = THREADS.find((th) => th.id === activeThread);

  return (
    <div className="flex flex-col h-screen bg-surface">
      <DashboardHeader 
        title="Messages" 
        role="TENANT" 
        subtitle="Conversations" 
      />

      {/* Main Inbox Layout */}
      <section className="flex flex-1 max-w-full mx-auto w-full px-0 md:px-8 py-0 md:py-6 overflow-hidden max-h-[calc(100vh-104px)]">
        
        {/* Left Sidebar - Chat List */}
        <div className={cn(
          "w-full md:w-80 lg:w-96 bg-surface-container-lowest border-r md:border border-outline/10 md:rounded-l-2xl flex-col shadow-sm transition-all absolute md:relative z-20 h-full",
          isMobileListOpen ? "flex" : "hidden md:flex"
        )}>
          {/* List Header & Search */}
          <div className="p-4 border-b border-outline/5 shrink-0 bg-surface-container-low/50">
            <h2 className="font-headline font-bold text-lg mb-4 text-primary">Inbox</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full bg-surface border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline"
              />
            </div>
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-2">
            {THREADS.map((thread) => (
              <div 
                key={thread.id} 
                onClick={() => handleThreadSelect(thread.id)}
                className={cn(
                  "flex items-start gap-4 p-4 cursor-pointer hover:bg-surface-container-low/50 transition-colors border-l-2",
                  activeThread === thread.id && !isMobileListOpen 
                    ? "bg-primary/5 border-primary" 
                    : "border-transparent"
                )}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 ring-1 ring-outline/10">
                    <img src={thread.avatar} alt={thread.name} className="w-full h-full object-cover" />
                  </div>
                  {thread.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4caf50] rounded-full border-2 border-surface-container-lowest"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-on-surface truncate pr-2">{thread.name}</span>
                    <span className={cn("text-[10px] shrink-0", thread.unread > 0 ? "text-primary font-bold" : "text-outline")}>
                      {thread.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p className={cn("text-xs truncate", thread.unread > 0 ? "text-on-surface font-bold" : "text-on-surface-variant")}>
                      {thread.lastMsg}
                    </p>
                    {thread.unread > 0 && (
                      <span className="bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                        {thread.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section - Chat Window */}
        <div className={cn(
          "flex-1 bg-surface-container-lowest md:border-y md:border-r border-outline/10 md:rounded-r-2xl flex-col h-full",
          !isMobileListOpen ? "flex" : "hidden md:flex"
        )}>
          {activeData ? (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 md:py-4 border-b border-outline/5 flex justify-between items-center bg-surface-container-lowest shrink-0">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsMobileListOpen(true)}
                    className="md:hidden p-2 -ml-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-1 ring-outline/10">
                    <img src={activeData.avatar} alt={activeData.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">{activeData.name}</h3>
                    <p className="text-[10px] text-secondary font-bold">
                      {activeData.online ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
                <button className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed relative">
                <div className="absolute inset-0 bg-surface/80 mix-blend-overlay z-0 pointer-events-none"></div>
                
                <div className="relative z-10 space-y-6">
                  {/* Date Separator */}
                  <div className="flex justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container px-3 py-1 rounded-full opacity-80 border border-outline/5">
                      Today
                    </span>
                  </div>

                  {/* Outgoing Msg */}
                  <div className="flex items-end gap-2 justify-end">
                    <div className="gradient-primary text-white px-4 py-3 rounded-2xl rounded-br-sm max-w-[85%] md:max-w-[70%] shadow-md">
                      <p className="text-sm font-medium text-white/90">Hello DeskWeave, I have attached my payment proof for the Skyline Suite 402.</p>
                      <div className="flex justify-end items-center gap-1 mt-1">
                        <span className="text-[10px] text-white/60">10:40 AM</span>
                        <CheckCheck className="w-3 h-3 text-secondary-container" />
                      </div>
                    </div>
                  </div>

                  {/* Incoming Msg */}
                  <div className="flex items-end gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-auto hidden md:block">
                      <img src={activeData.avatar} alt={activeData.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="bg-surface border border-outline/5 px-4 py-3 rounded-2xl rounded-bl-sm max-w-[85%] md:max-w-[70%] shadow-sm">
                      <p className="text-sm font-medium text-on-surface">Hi! Received. I will verify it right now and update your status.</p>
                      <span className="text-[10px] text-outline mt-2 block w-full">10:41 AM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-surface-container-lowest border-t border-outline/5 shrink-0">
                <div className="flex items-center gap-2 bg-surface-container-low rounded-xl pr-2 border border-outline/5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
                  <button className="p-3 text-on-surface-variant hover:text-primary transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input 
                    type="text" 
                    placeholder="Type your message..." 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 outline-none"
                  />
                  <button className="p-2 gradient-primary rounded-lg text-white shadow-md hover:scale-105 active:scale-95 transition-transform flex items-center justify-center">
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-surface/30">
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4 text-primary">
                <Search className="w-8 h-8 opacity-50" />
              </div>
              <h3 className="font-bold text-lg text-on-surface font-headline">Select a conversation</h3>
              <p className="text-xs text-on-surface-variant max-w-xs mt-2">Choose an existing conversation from the list or start a new chat with the owner.</p>
            </div>
          )}
        </div>

      </section>
    </div>
  );
}
