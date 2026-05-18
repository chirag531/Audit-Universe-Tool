import { Link, useLocation, useParams } from "react-router-dom";
import { Bell, ChevronRight, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Dropdown, type DropdownItem } from "@/components/ui/Dropdown";
import { Tooltip } from "@/components/ui/Tooltip";
import { Badge } from "@/components/ui/Badge";

export interface AppHeaderProps {
  onOpenMobileNav: () => void;
}

function useCrumbItems(): { label: string; to?: string }[] {
  const { pathname } = useLocation();
  const { id } = useParams();
  const items: { label: string; to?: string }[] = [{ label: "Home", to: "/" }];
  if (pathname === "/") {
    items.push({ label: "Dashboard" });
    return items;
  }
  if (pathname.startsWith("/audits")) {
    items.push({ label: "Audits", to: "/audits" });
    if (id) items.push({ label: `Audit #${id}` });
    return items;
  }
  if (pathname.startsWith("/analytics")) {
    items.push({ label: "Analytics" });
    return items;
  }
  items.push({ label: "Page" });
  return items;
}

export function AppHeader({ onOpenMobileNav }: AppHeaderProps) {
  const crumbs = useCrumbItems();
  const { logout, role, displayName } = useAuth();
  const name = displayName || "User";

  const menuItems: DropdownItem[] = [
    { key: "logout", label: "Sign out", danger: true, onSelect: () => logout() },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-3 shadow-sm backdrop-blur md:px-4">
      <Button variant="ghost" className="h-9 w-9 p-0 md:hidden" aria-label="Open navigation" onClick={onOpenMobileNav}>
        <Menu className="h-5 w-5" />
      </Button>

      <nav className="flex min-w-0 flex-1 items-center gap-1 text-sm text-slate-600" aria-label="Breadcrumb">
        {crumbs.map((c, i) => (
          <span key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-1">
            {i > 0 ? <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden /> : null}
            {c.to ? (
              <Link to={c.to} className="truncate font-medium text-slate-700 hover:text-primary-600">
                {c.label}
              </Link>
            ) : (
              <span className="truncate font-semibold text-slate-900">{c.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="hidden items-center gap-2 sm:flex">
        {role ? <Badge tone="info">{role}</Badge> : null}
      </div>

      <div className="flex items-center gap-1">
        <Tooltip label="Notifications (demo)">
          <Button variant="ghost" className="h-9 w-9 p-0" aria-label="Notifications">
            <Bell className="h-5 w-5 text-slate-600" />
          </Button>
        </Tooltip>

        <Dropdown
          align="right"
          menuLabel="Account menu"
          trigger={
            <span className="inline-flex cursor-pointer items-center gap-2 rounded-md p-1 hover:bg-slate-50 focus-visible:focus-ring">
              <Avatar name={name} />
              <span className="hidden max-w-[120px] truncate text-sm font-medium text-slate-800 lg:inline">{name}</span>
            </span>
          }
          items={menuItems}
        />
      </div>
    </header>
  );
}
