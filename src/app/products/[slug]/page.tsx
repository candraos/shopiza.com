import { notFound } from "next/navigation";

import { DiscountCountdown } from "@/components/store/discount-countdown";
import { ProductCarousel } from "@/components/store/product-carousel";
import { ProductCard } from "@/components/store/product-card";
import { QuantityPicker } from "@/components/store/product-detail-quantity";
import { Badge } from "@/components/ui/badge";
import { redirectAdminHome } from "@/lib/auth/current-user";
import { formatCurrency } from "@/lib/utils";
import { getProductBySlug } from "@/lib/services/catalog";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await redirectAdminHome();

  const { slug } = await params;
  const result = await getProductBySlug(slug);

  if (!result) {
    notFound();
  }

  const { product, relatedProducts } = result;

  return (
    <div className="container-shell space-y-14 py-12">
      <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <ProductCarousel images={product.images} productName={product.name} />
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>{product.section?.name ?? "Unassigned"}</Badge>
              {product.activeDiscount ? (
                <Badge tone="discount">Discount available</Badge>
              ) : null}
              {product.stock <= 0 ? (
                <Badge tone="danger">Out of stock</Badge>
              ) : (
                <Badge tone="success">{product.stock} in stock</Badge>
              )}
            </div>
            <div>
              <h1 className="display-title text-4xl font-semibold text-[var(--navy-950)]">
                {product.name}
              </h1>
              <p className="mt-4 text-base leading-8 text-[var(--ink-700)]">
                {product.description}
              </p>
            </div>
          </div>

          <div className="glass-card rounded-[32px] p-6">
            <div className="flex flex-wrap items-end gap-3">
              <p className="text-4xl font-semibold text-[var(--navy-950)]">
                {formatCurrency(product.effectivePriceCents)}
              </p>
              {product.activeDiscount ? (
                <p className="pb-1 text-lg text-[var(--ink-500)] line-through">
                  {formatCurrency(product.priceCents)}
                </p>
              ) : null}
            </div>
            {product.activeDiscount ? (
              <div className="mt-5">
                <DiscountCountdown endAt={product.activeDiscount.endAt} />
              </div>
            ) : null}
            <div className="mt-6">
              <QuantityPicker
                productId={product.id}
                maxQuantity={Math.max(product.stock, 1)}
                disabled={product.stock <= 0}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="glass-card rounded-[28px] p-5">
              <h2 className="display-title text-xl font-semibold text-[var(--navy-950)]">
                Premium shopping details
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-700)]">
                Orders are confirmed through a secure backend flow and delivered
                with cash on delivery for a simple purchase experience.
              </p>
            </div>
            <div className="glass-card rounded-[28px] p-5">
              <h2 className="display-title text-xl font-semibold text-[var(--navy-950)]">
                Stock-aware cart reservation
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-700)]">
                Available stock updates when items are reserved in cart, helping
                protect inventory accuracy before checkout.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--pink-500)]">
              Keep browsing
            </p>
            <h2 className="mt-2 display-title text-3xl font-semibold text-[var(--navy-950)]">
              Related products
            </h2>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {relatedProducts.map((relatedProduct) => (
            <ProductCard key={relatedProduct.id} product={relatedProduct} />
          ))}
        </div>
      </section>
    </div>
  );
}
