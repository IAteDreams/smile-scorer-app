import type { SubmitEventHandler } from "react";

export type FieldErrors<T> = Partial<Record<keyof T, string[]>>;

/** What `useForm` returns; pass it straight to a form component's props. */
export type FormState<T> = {
  onSubmit: SubmitEventHandler<HTMLFormElement>;
  pending: boolean;
  errors: FieldErrors<T>;
  formError: string | null;
};
