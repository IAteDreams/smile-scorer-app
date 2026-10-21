export const LINKS = {
  public: {
    home: "/",
    howItWorks: "/#how-it-works",
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

export const API = {
  upload: (id: string, { download = false } = {}) =>
    `/api/upload/${id}${download ? "?download=1" : ""}`,
} as const;
