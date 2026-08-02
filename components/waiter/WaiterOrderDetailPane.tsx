import { useCallback, useState } from "react";

import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingView } from "@/components/ui/LoadingView";
import { WaiterOrderDetailPanel } from "@/components/waiter/WaiterOrderDetailPanel";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useOrdersRealtime } from "@/hooks/useOrdersRealtime";
import { claimOrder, completeOrder, fetchOrderById } from "@/lib/api/orders";
import { showAlert } from "@/lib/alert";
import { toFriendlyErrorMessage } from "@/lib/supabase";

/** Belirli bir sipariş id'sini çeker + realtime tazeler; hem tam ekran rotada hem split view sağ panelinde kullanılır. */
export function WaiterOrderDetailPane({ orderId }: { orderId: string }) {
  const { data: order, loading, error, refetch } = useAsyncData(() => fetchOrderById(orderId), [orderId]);
  const [processing, setProcessing] = useState(false);

  useOrdersRealtime(useCallback(() => refetch(), [refetch]));

  async function handleClaim() {
    if (!order) return;
    setProcessing(true);
    try {
      await claimOrder(order.id);
      refetch();
    } catch (err) {
      showAlert("Sipariş görülemedi", toFriendlyErrorMessage(err));
      refetch();
    } finally {
      setProcessing(false);
    }
  }

  async function handleComplete() {
    if (!order) return;
    setProcessing(true);
    try {
      await completeOrder(order.id);
      refetch();
    } catch (err) {
      showAlert("İşlem tamamlanamadı", toFriendlyErrorMessage(err));
      refetch();
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <LoadingView />;
  if (error || !order) return <ErrorState message={error ?? "Sipariş bulunamadı."} onRetry={refetch} />;

  return (
    <WaiterOrderDetailPanel order={order} onClaim={handleClaim} onComplete={handleComplete} processing={processing} />
  );
}
