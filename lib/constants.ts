export const LINKS = {
  public: {
    home: "/",
    terms: "/terms",
    privacy: "/privacy",
  },
  guest: {
    signIn: "/sign-in",
    signUp: "/sign-up",
  },
  protected: {
    dashboard: "/dashboard",
  },
} as const;
