import { Platform } from "react-native";

import { statusLabels } from "@/constants/theme";
import type { OrderWithDetails } from "@/types/database";

/** Tarayıcıda bir CSV dosyası indirmesi tetikler. Native'de no-op (dosya indirme UI'ı web'e özgü). */
export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  if (Platform.OS !== "web") return;

  const escapeCell = (value: string | number) => {
    const str = String(value ?? "");
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(","));
  // Başa BOM ekleniyor: Excel Türkçe karakterleri (ç, ş, ğ...) BOM olmadan bozuyor.
  const csv = "﻿" + lines.join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const ORDER_CSV_HEADERS = ["Sipariş No", "Tarih", "Durum", "Ürünler", "Konum", "Not"];

function orderItemsSummary(order: OrderWithDetails): string {
  if (order.order_type === "pickup") return "Boş toplama ricası";
  if (order.order_type === "call") return "Görevli çağrısı";
  return order.order_items.map((item) => `${item.quantity}x ${item.product_name}`).join(", ");
}

function ordersToCsvRows(orders: OrderWithDetails[]): (string | number)[][] {
  return orders.map((order) => [
    order.order_number,
    new Date(order.created_at).toLocaleString("tr-TR"),
    statusLabels[order.status] ?? order.status,
    orderItemsSummary(order),
    order.location?.name ?? order.custom_location ?? "",
    order.note ?? "",
  ]);
}

/** Sipariş listesini "Sipariş No, Tarih, Durum, Ürünler, Konum, Not" kolonlarıyla CSV olarak indirir. */
export function downloadOrdersCsv(filename: string, orders: OrderWithDetails[]) {
  downloadCsv(filename, ORDER_CSV_HEADERS, ordersToCsvRows(orders));
}
