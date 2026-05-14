import { ProductCard } from "@/components/store/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getStoreSections, listProducts } from "@/lib/services/catalog";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    section?: string;
  }>;
}) {
  const params = await searchParams;
  const [sections, result] = await Promise.all([
    getStoreSections(),
    listProducts({
      query: params.q?.trim(),
      sectionSlug: params.section,
    }),
  ]);

  return (
    <div className="container-shell space-y-10 py-12">
      <div className="glass-card rounded-[36px] p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--pink-500)]">
          Shop catalog
        </p>
        <h1 className="mt-3 display-title text-4xl font-semibold text-[var(--navy-950)]">
          Browse curated products
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-700)]">
          Search across premium essentials, filter by section, and explore
          products with clean pricing, stock visibility, and real-time discounts.
        </p>
        <form className="mt-8 grid gap-4 md:grid-cols-[1fr_240px_auto]">
          <input
            type="search"
            name="q"
            defaultValue={params.q}
            placeholder="Search for laptops, speakers, lighting, and more"
            className="w-full rounded-2xl border border-[var(--line-soft)] bg-white px-4 py-3 text-sm shadow-[0_10px_18px_rgba(17,24,39,0.04)] outline-none focus:border-[rgba(244,71,161,0.45)]"
          />
          <select
            name="section"
            defaultValue={params.section ?? ""}
            className="rounded-2xl border border-[var(--line-soft)] bg-white px-4 py-3 text-sm shadow-[0_10px_18px_rgba(17,24,39,0.04)] outline-none focus:border-[rgba(244,71,161,0.45)]"
          >
            <option value="">All sections</option>
            {sections.map((section) => (
              <option key={section.id} value={section.slug}>
                {section.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-2xl bg-[var(--navy-950)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--navy-800)]"
          >
            Apply filters
          </button>
        </form>
      </div>

      {result.products.length === 0 ? (
        <EmptyState
          title="No products matched your filters"
          description="Try a broader search or switch to another section to explore the catalog."
          ctaLabel="Clear filters"
          ctaHref="/products"
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {result.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
