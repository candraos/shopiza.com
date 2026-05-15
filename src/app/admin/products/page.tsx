import { ProductListManager } from "@/components/admin/product-list-manager";
import { getAdminProducts } from "@/lib/services/catalog";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--pink-500)]">
          Catalog
        </p>
        <h1 className="mt-2 display-title text-4xl font-semibold text-[var(--navy-950)]">
          Manage products
        </h1>
      </div>
      <ProductListManager
        products={products.map((product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          stock: product.stock,
          priceCents: product.priceCents,
          archived: product.archived,
          mainImage: product.mainImage
            ? {
                imageUrl: product.mainImage.imageUrl,
                altText: product.mainImage.altText,
              }
            : null,
          section: product.section
            ? {
                name: product.section.name,
              }
            : null,
        }))}
      />
    </div>
  );
}
