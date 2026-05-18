import { AnimatePresence, motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import { BarChart3, ClipboardList, LayoutDashboard, X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface AppSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/audits", label: "Audits", icon: ClipboardList, end: false },
  { to: "/analytics", label: "Analytics", icon: BarChart3, end: false },
];

export function AppSidebar({ mobileOpen, onCloseMobile }: AppSidebarProps) {
  const location = useLocation();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
      isActive ? "bg-primary-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"
    );

  const Nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={linkClass}
          onClick={() => onCloseMobile()}
        >
          <Icon className="h-5 w-5 shrink-0" aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col md:shadow-card">
        <div className="flex h-14 items-center border-b border-slate-100 px-4">
          <span className="text-sm font-semibold tracking-tight text-slate-900">Audit Universe</span>
        </div>
        {Nav}
      </aside>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/40"
              aria-label="Close menu"
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="absolute left-0 top-0 flex h-full w-60 flex-col border-r border-slate-200 bg-white shadow-card-md"
            >
              <div className="flex h-14 items-center justify-between border-b border-slate-100 px-4">
                <span className="text-sm font-semibold text-slate-900">Menu</span>
                <button
                  type="button"
                  className="rounded-md p-2 text-slate-600 hover:bg-slate-100 focus-visible:focus-ring"
                  aria-label="Close"
                  onClick={onCloseMobile}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {Nav}
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <span className="sr-only" aria-live="polite">
        {location.pathname}
      </span>
    </>
  );
}
