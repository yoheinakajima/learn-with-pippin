import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { InventoryScreen } from "@/components/inventory/InventoryScreen";
import { LeftHeaderLayout } from "@/components/layout/LeftHeaderLayout";

export default function InventoryPage() {
  const { activeChildSession } = useAuth();
  const params = useParams<{ childId: string }>();
  const [, navigate] = useLocation();

  const childId = parseInt(params.childId);

  // Redirect if no active child session
  useEffect(() => {
    if (!activeChildSession) {
      navigate("/");
      return;
    }

    // Make sure the childId in URL matches the active session
    if (activeChildSession.childId !== childId) {
      navigate(`/inventory/${activeChildSession.childId}`);
    }
  }, [activeChildSession, childId, navigate]);

  if (!activeChildSession) {
    return null;
  }

  return (
    <LeftHeaderLayout>
      <div className="flex-grow container mx-auto px-4 py-6">
        <InventoryScreen childId={childId} />
      </div>
      <MobileNav />
    </LeftHeaderLayout>
  );
}
