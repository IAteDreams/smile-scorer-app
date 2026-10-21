import { useState, useTransition, type SubmitEvent } from "react";
import { z } from "zod";
import type { FieldErrors, FormState } from "@/types/form";

export function useForm<TSchema extends z.ZodType<Record<string, unknown>>>(
  schema: TSchema,
  onValid: (values: z.infer<TSchema>) => Promise<string | void>,
): FormState<z.infer<TSchema>> {
  type Values = z.infer<TSchema>;

  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FieldErrors<Values>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = schema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    if (!parsed.success) {
      setErrors(
        z.flattenError(parsed.error).fieldErrors as FieldErrors<Values>,
      );
      return;
    }
    setErrors({});
    setFormError(null);

    startTransition(async () => {
      const error = await onValid(parsed.data);
      if (error) setFormError(error);
    });
  };

  return { onSubmit, pending, errors, formError };
}
