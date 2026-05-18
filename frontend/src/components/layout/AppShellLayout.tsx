import { Outlet } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { PageTransition } from "@/components/ui/PageTransition";

export function AppShellLayout() {
  return (
    <AppShell>
      <PageTransition>
        <Outlet />
      </PageTransition>
    </AppShell>
  );
}
