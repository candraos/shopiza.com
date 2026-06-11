import { ContactForm } from "@/components/forms/contact-form";

export const metadata = {
  title: "Contact Us",
};

export default function ContactPage() {
  return (
    <div className="container-shell py-14">
      <div className="mx-auto max-w-2xl">
        <h1 className="display-title text-3xl font-semibold text-[var(--navy-950)]">
          Contact Us
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-700)]">
          Have a question or need help with an order? Send us a message and
          we&apos;ll get back to you.
        </p>
        <div className="mt-8">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
