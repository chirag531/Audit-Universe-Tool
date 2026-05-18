import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function NotFoundPage() {
  const nav = useNavigate();
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <Card className="max-w-md shadow-card-md">
          <CardContent className="space-y-4 p-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">404</p>
            <h1 className="text-2xl font-semibold text-slate-900">Page not found</h1>
            <p className="text-sm text-slate-600">The page you are looking for does not exist or was moved.</p>
            <Button type="button" leftIcon={<Home className="h-4 w-4" />} onClick={() => nav("/")}>
              Back to dashboard
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
