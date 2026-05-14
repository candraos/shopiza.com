import { ContactForm } from "@/components/forms/contact-form";

export default function ContactPage() {
  return (
    <div className="container-shell grid gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="mesh-accent spotlight-border rounded-[40px] p-8 text-white md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/78">
          Contact Shopiza
        </p>
        <h1 className="mt-4 display-title text-4xl font-semibold">
          Reach support with a message that actually goes somewhere.
        </h1>
        <p className="mt-5 max-w-lg text-sm leading-8 text-white/78">
          Ask about stock, delivery, discounts, or product recommendations.
          Messages are stored securely and also forwarded to support.
        </p>
      </section>
      <section className="glass-card rounded-[40px] p-8 md:p-10">
        <ContactForm />
      </section>
    </div>
  );
}
