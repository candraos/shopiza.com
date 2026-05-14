import { OrdersManager } from "@/components/admin/orders-manager";
import { getAdminOrders } from "@/lib/services/orders";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--pink-500)]">
          Orders
        </p>
        <h1 className="mt-2 display-title text-4xl font-semibold text-[var(--navy-950)]">
          Track and update orders
        </h1>
      </div>
      <OrdersManager orders={orders} />
    </div>
  );
}
