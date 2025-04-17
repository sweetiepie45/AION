import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Brain, Calendar, ChartLine, LayoutDashboard, Network, Bot, User } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAppContext();
  
  const navItems: SidebarItem[] = [
    {
      name: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "AutoScheduler",
      href: "/auto-scheduler",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      name: "Mind Mirror",
      href: "/mind-mirror",
      icon: <Brain className="w-5 h-5" />,
    },
    {
      name: "Finance Flow",
      href: "/finance-flow",
      icon: <ChartLine className="w-5 h-5" />,
    },
    {
      name: "LifeGraph",
      href: "/life-graph",
      icon: <Network className="w-5 h-5" />,
    },
    {
      name: "SmartAgent",
      href: "/smart-agent",
      icon: <Bot className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-neutral-200 bg-white h-screen sticky top-0">
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white">
            <Brain className="w-5 h-5" />
          </div>
          <h1 className="ml-3 text-xl font-bold text-neutral-800">Aion</h1>
        </div>
        <p className="text-xs text-neutral-500 mt-1">The OS for your real life</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.href} className="px-2 mb-1">
              <Link href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg",
                    location === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}
                >
                  {item.icon}
                  <span className={cn("ml-3", location === item.href ? "font-medium" : "")}>
                    {item.name}
                  </span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center">
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={`${user.fullName}'s profile`} 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
              <User className="w-4 h-4 text-neutral-500" />
            </div>
          )}
          <div className="ml-3">
            <p className="text-sm font-medium text-neutral-800">{user?.fullName || "Guest User"}</p>
            <p className="text-xs text-neutral-500">{user?.email || "guest@example.com"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
