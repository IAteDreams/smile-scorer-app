import { z } from "zod";
import { ERRORS } from "@/lib/error";

export const signInSchema = z.object({
  email: z.email(ERRORS.validation.emailInvalid),
  password: z.string().min(1, ERRORS.validation.passwordRequired),
});

export const signUpSchema = z.object({
  name: z.string().trim().min(1, ERRORS.validation.nameRequired),
  email: z.email(ERRORS.validation.emailInvalid),
  password: z
    .string()
    .min(8, ERRORS.validation.passwordTooShort)
    .max(128, ERRORS.validation.passwordTooLong),
});
