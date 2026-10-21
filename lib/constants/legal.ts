export type LegalSection = {
  id: string;
  title: string;
  paragraphs: readonly string[];
};

export const PRIVACY_POLICY = {
  lastUpdated: "October 21, 2026",
  summary:
    "we store your photos only to show your history. We never sell them, never use them to train models, and you can delete them at any time.",
  sections: [
    {
      id: "what-we-collect",
      title: "What we collect",
      paragraphs: [
        "Account details: your name, your email address, and your password, which we store only as a secure hash.",
        "The photos you upload and the analysis results for each photo, such as smile confidence, emotions and face position.",
        "Sign-in sessions: the IP address and browser of each session, used to keep your account secure. Sessions expire after 7 days.",
      ],
    },
    {
      id: "how-photos-are-analyzed",
      title: "How photos are analyzed",
      paragraphs: [
        "Photos are sent to Amazon Rekognition for face attribute detection. We do not create face collections or biometric templates, and we do not identify people.",
        "We use a few providers to run Smilescore: Amazon Web Services (photo analysis), Supabase (database), Upstash (sign-in sessions), Resend (account emails) and Vercel (hosting). They process data only on our behalf.",
      ],
    },
    {
      id: "retention-and-deletion",
      title: "Retention and deletion",
      paragraphs: [
        "Photos and scores are kept until you delete them or close your account. Deleted photos are removed from storage within 30 days.",
      ],
    },
    {
      id: "cookies",
      title: "Cookies",
      paragraphs: [
        "We use one essential cookie to keep you signed in. We don't use analytics or advertising cookies.",
      ],
    },
    {
      id: "your-rights",
      title: "Your rights",
      paragraphs: [
        "You can ask to see, correct, export or delete your data at any time. You can also delete your photos and your account yourself from Settings.",
        "If you live in the EU or UK, you can also object to how we process your data and complain to your local data protection authority.",
      ],
    },
    {
      id: "contact",
      title: "Contact",
      paragraphs: [
        "Questions about your privacy, or a request about your data? Email privacy@smilescore.app.",
      ],
    },
  ] satisfies readonly LegalSection[],
} as const;
