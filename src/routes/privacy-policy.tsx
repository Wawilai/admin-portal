import { createFileRoute } from "@tanstack/react-router";

const lastUpdated = "July 13, 2026";

const sections = [
  {
    title: "Information we collect",
    body: [
      "Account information, such as your authentication user ID and email address, when you sign in with supported providers.",
      "Profile information you choose to enter for astrology features, such as birth date, birth time, birth place or coordinates, gender where required by a calculation, locale, and timezone.",
      "App activity and service data, such as feature usage, subscription or credit status, purchase receipt identifiers, referral or promo code activity, notification preferences, and diagnostic records needed to operate the service.",
      "Messages or free text that you submit to AI-assisted features. Where possible, the app removes direct identifiers before sending text for AI processing.",
      "Device or notification data, such as Firebase Cloud Messaging tokens, when you enable push notifications.",
    ],
  },
  {
    title: "How we use information",
    body: [
      "To provide account access, sync user state, and protect the service from unauthorized use.",
      "To calculate astrology, calendar, profile, and personalized reading features requested by you.",
      "To process subscriptions, credits, trials, purchases, referrals, and promo code eligibility.",
      "To send service notifications that you enable, such as daily or feature-specific reminders.",
      "To maintain app reliability, measure feature performance, troubleshoot issues, and improve the user experience.",
    ],
  },
  {
    title: "Sharing and third-party services",
    body: [
      "We do not sell personal information.",
      "We may process data with service providers that help operate the app, including Firebase or Google services for authentication, messaging, analytics, crash reporting, and app distribution; payment platforms for purchases and subscriptions; backend hosting and database providers; and AI providers used through our backend service.",
      "AI requests are routed through our backend. We do not place AI provider keys in the mobile app, and we aim to send only the information needed for the requested feature.",
      "We may disclose information when required by law, to protect users, or to prevent abuse of the service.",
    ],
  },
  {
    title: "Storage, security, and retention",
    body: [
      "We use reasonable technical and organizational measures to protect user data, including authenticated API access, server-side processing, and limited administrative access.",
      "Some app preferences, cached calendar data, profile data, consent records, and feature state may be stored locally on your device for speed and offline use.",
      "We retain information only as long as needed to provide the service, meet legal or payment obligations, resolve disputes, prevent abuse, and maintain security.",
      "Deletion from backups and logs may take additional time according to our normal retention and security processes.",
    ],
  },
  {
    title: "Your choices and deletion",
    body: [
      "You can update or delete local profiles and many preferences inside the app.",
      "You can disable push notifications in the app or in your device settings.",
      "You may request account or data deletion by using the in-app account deletion controls where available or by contacting us at privacy@rerkdee.app.",
      "Deleting your account or app data may remove access to synced profile data, subscriptions managed by us, credit balances, and personalized history, except where retention is required for legal, security, or payment records.",
    ],
  },
  {
    title: "Children",
    body: [
      "The app is not intended for children. If we learn that we have collected personal information from a child without appropriate consent, we will take steps to delete it.",
    ],
  },
  {
    title: "Changes to this policy",
    body: [
      "We may update this Privacy Policy to reflect product, legal, or operational changes. The latest version will be posted on this page with an updated date.",
    ],
  },
];

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy - Rerkdee" },
      {
        name: "description",
        content:
          "Privacy Policy for Rerkdee, including data collection, use, sharing, retention, security, and deletion practices.",
      },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-6 lg:py-14">
        <div className="border-b border-border pb-8">
          <p className="text-eyebrow">Rerkdee</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            This Privacy Policy explains how Rerkdee collects, uses, shares,
            protects, retains, and deletes information when you use our mobile
            app and related services.
          </p>
          <p className="mt-4 text-sm font-medium text-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        <section className="border-b border-border py-8">
          <h2 className="text-lg font-semibold text-foreground">
            Developer and privacy contact
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Rerkdee is provided by the Rerkdee app developer. For privacy
            questions, access requests, correction requests, or deletion
            requests, contact us at{" "}
            <a
              className="font-medium text-primary underline-offset-4 hover:underline"
              href="mailto:privacy@rerkdee.app"
            >
              privacy@rerkdee.app
            </a>
            .
          </p>
        </section>

        {sections.map((section) => (
          <section key={section.title} className="border-b border-border py-8">
            <h2 className="text-lg font-semibold text-foreground">
              {section.title}
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              {section.body.map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="pt-8">
          <h2 className="text-lg font-semibold text-foreground">
            Regional rights
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Depending on your location, you may have rights to access, correct,
            delete, restrict, or object to certain processing of your personal
            information. Contact us at privacy@rerkdee.app to submit a request.
          </p>
        </section>
      </div>
    </main>
  );
}
