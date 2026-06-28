import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { SiteNav } from "@/components/site/site-nav";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <>
      <SiteNav />
      <LegalPage title="Terms of Service">
        <p>
          By creating a Novelo account or publishing stories on the platform, you agree to these terms.
          Novelo is operated as a personal story library where readers sign in to read and may unlock
          paid titles with a one-time payment.
        </p>

        <h2 className="font-display text-xl font-semibold text-[var(--color-foreground)]">
          For readers
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>You must provide accurate account information and keep your password secure.</li>
          <li>Story previews are free to browse; full access to paid stories requires purchase.</li>
          <li>Do not share purchased content in ways that violate copyright or these terms.</li>
          <li>Reviews and feedback you post must be honest and respectful.</li>
        </ul>

        <h2 className="font-display text-xl font-semibold text-[var(--color-foreground)]">
          For writers
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>You retain ownership of your original work published on Novelo.</li>
          <li>You grant Novelo a license to display, promote, and sell access to your stories on the site.</li>
          <li>You confirm you have the rights to publish the content you upload.</li>
          <li>Pricing and paywall settings you set apply to new reader purchases from that point forward.</li>
        </ul>

        <h2 className="font-display text-xl font-semibold text-[var(--color-foreground)]">
          General
        </h2>
        <p>
          We may update these terms from time to time. Continued use of Novelo after changes means you
          accept the updated terms. Contact the site administrator for questions about your account or
          published work.
        </p>
      </LegalPage>
    </>
  );
}
