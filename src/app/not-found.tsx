import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="container-shell py-12">
      <EmptyState
        title="We couldn’t find that page"
        description="The route you requested does not exist, or the content was moved to another part of Shopiza."
        ctaLabel="Go back home"
        ctaHref="/"
      />
    </div>
  );
}
