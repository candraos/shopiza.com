'use client';

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { TextAreaField, TextField } from "@/components/ui/field";

export function ContactForm() {
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        setPending(true);
        setErrors({});

        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = (await response.json()) as {
          message?: string;
          errors?: Record<string, string[]>;
        };

        if (!response.ok) {
          setErrors(data.errors ?? {});
          toast.error(data.message ?? "Could not send your message.");
          setPending(false);
          return;
        }

        form.reset();
        toast.success("Your message has been sent.");
        setPending(false);
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <TextField label="Name" name="name" placeholder="Your full name" />
          {errors.name ? (
            <p className="mt-2 text-xs text-[var(--danger-500)]">{errors.name[0]}</p>
          ) : null}
        </div>
        <div>
          <TextField label="Email" name="email" type="email" placeholder="you@example.com" />
          {errors.email ? (
            <p className="mt-2 text-xs text-[var(--danger-500)]">{errors.email[0]}</p>
          ) : null}
        </div>
      </div>
      <div>
        <TextAreaField label="Message" name="message" placeholder="How can we help?" />
        {errors.message ? (
          <p className="mt-2 text-xs text-[var(--danger-500)]">{errors.message[0]}</p>
        ) : null}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
