import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShellLayout } from "@/components/layout/AppShellLayout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { AuditListPage } from "@/pages/AuditListPage";
import { AuditDetailPage } from "@/pages/AuditDetailPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShellLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/audits" element={<AuditListPage />} />
          <Route path="/audits/:id" element={<AuditDetailPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Route>
      </Route>
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
