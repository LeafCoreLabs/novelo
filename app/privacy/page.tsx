import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { SiteNav } from "@/components/site/site-nav";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <SiteNav />
      <LegalPage title="Privacy Policy">
        <p>
          Novelo collects only what is needed to run your account, save reading progress, process story
          unlocks, and improve the reading experience.
        </p>

        <h2 className="font-display text-xl font-semibold text-[var(--color-foreground)]">
          What we collect
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Account details such as name, email, and password (stored hashed).</li>
          <li>Reading activity including bookmarks, purchases, and reviews you submit.</li>
          <li>Newsletter email if you subscribe on the homepage.</li>
        </ul>

        <h2 className="font-display text-xl font-semibold text-[var(--color-foreground)]">
          How we use it
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>To authenticate you and enforce paywalls for paid stories.</li>
          <li>To display community reviews in the “Readers and writers agree” section.</li>
          <li>To send chapter updates when you opt into the newsletter.</li>
        </ul>

        <h2 className="font-display text-xl font-semibold text-[var(--color-foreground)]">
          Your choices
        </h2>
        <p>
          You can sign out at any time. To delete your account or request data removal, contact the site
          administrator. We do not sell your personal information to third parties.
        </p>
      </LegalPage>
    </>
  );
}
