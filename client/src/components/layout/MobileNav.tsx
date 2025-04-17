import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Brain, Calendar, ChartLine, LayoutDashboard, User } from "lucide-react";

interface MobileNavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export default function MobileNav() {
  const [location] = useLocation();
  
  const navItems: MobileNavItem[] = [
    {
      name: "Home",
      href: "/",
      icon: <LayoutDashboard className="text-lg" />,
    },
    {
      name: "Schedule",
      href: "/auto-scheduler",
      icon: <Calendar className="text-lg" />,
    },
    {
      name: "Mind",
      href: "/mind-mirror",
      icon: <Brain className="text-lg" />,
    },
    {
      name: "Finance",
      href: "/finance-flow",
      icon: <ChartLine className="text-lg" />,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: <User className="text-lg" />,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-10">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a className={cn(
              "flex flex-col items-center justify-center", 
              location === item.href ? "text-primary" : "text-neutral-400"
            )}>
              {item.icon}
              <span className="text-xs mt-1">{item.name}</span>
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
}
