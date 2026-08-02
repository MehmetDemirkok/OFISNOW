import { useCallback, useState } from "react";

import { EmployeeOrderDetailPanel } from "@/components/employee/EmployeeOrderDetailPanel";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingView } from "@/components/ui/LoadingView";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useOrdersRealtime } from "@/hooks/useOrdersRealtime";
import { cancelOrder, fetchOrderById } from "@/lib/api/orders";
import { showAlert } from "@/lib/alert";
import { toFriendlyErrorMessage } from "@/lib/supabase";

/** Belirli bir sipariş id'sini çeker + realtime tazeler; hem tam ekran rotada hem split view sağ panelinde kullanılır. */
export function EmployeeOrderDetailPane({ orderId }: { orderId: string }) {
  const { data: order, loading, error, refetch } = useAsyncData(() => fetchOrderById(orderId), [orderId]);
  const [cancelling, setCancelling] = useState(false);

  useOrdersRealtime(useCallback(() => refetch(), [refetch]));

  async function handleCancel() {
    if (!order) return;
    showAlert("Siparişi iptal et", "Bu siparişi iptal etmek istediğinize emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "İptal Et",
        style: "destructive",
        onPress: async () => {
          setCancelling(true);
          try {
            await cancelOrder(order.id);
            refetch();
          } catch (err) {
            showAlert("Hata", toFriendlyErrorMessage(err));
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  }

  if (loading) return <LoadingView />;
  if (error || !order) return <ErrorState message={error ?? "Sipariş bulunamadı."} onRetry={refetch} />;

  return <EmployeeOrderDetailPanel order={order} onCancel={handleCancel} cancelling={cancelling} />;
}
