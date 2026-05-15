import { DiscountsManager } from "@/components/admin/discounts-manager";
import { getAdminDiscounts } from "@/lib/services/admin";
import { getAdminProducts } from "@/lib/services/catalog";

export default async function AdminDiscountsPage() {
  const [discounts, products] = await Promise.all([
    getAdminDiscounts(),
    getAdminProducts(),
  ]);
  const availableProducts = products.filter((product) => !product.activeDiscount);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--pink-500)]">
          Promotions
        </p>
        <h1 className="mt-2 display-title text-4xl font-semibold text-[var(--navy-950)]">
          Manage discounts
        </h1>
      </div>
      <DiscountsManager
        discounts={discounts}
        products={availableProducts.map((product) => ({
          id: product.id,
          name: product.name,
          priceCents: product.priceCents,
        }))}
      />
    </div>
  );
}
