import { Outlet, Link, useLocation } from "react-router";
import { Home, TrendingUp, User, BookOpen, Settings } from "lucide-react";

export function Layout() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Overview" },
    { path: "/dynamics", icon: TrendingUp, label: "Dynamics" },
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/logic", icon: BookOpen, label: "Logic" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0e8ff] via-[#e8f4ff] to-[#f0e8ff] pb-20" style={{ fontFamily: 'Domine, serif' }}>
      {/* Main content */}
      <main className="max-w-md mx-auto">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-purple-200/40 shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-around px-2 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                    isActive 
                      ? "text-purple-700 bg-purple-100/60" 
                      : "text-slate-500 hover:text-purple-600"
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px]">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}