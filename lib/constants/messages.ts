export const MESSAGES = {
  photo: {
    downloading: (fileName: string) => `Downloading ${fileName}`,
    scored: (fileName: string, score: number, label: string) =>
      `${fileName} scored ${score}: ${label}`,
  },
} as const;
