import { useState } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Brain } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-neutral-200 bg-white sticky top-0 z-10">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white">
              <Brain className="w-4 h-4" />
            </div>
            <h1 className="ml-2 text-lg font-bold text-neutral-800">Aion</h1>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100">
                <Menu />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </header>

        {/* Page Content */}
        {children}

        {/* Mobile Navigation */}
        <MobileNav />
        
        {/* Add bottom padding on mobile to account for navigation */}
        <div className="h-16 lg:hidden"></div>
      </main>
    </div>
  );
}
