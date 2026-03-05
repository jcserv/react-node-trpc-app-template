import { TRPCError } from "@trpc/server";
import { ZodError } from "zod";

export interface FormattedError {
  message: string;
  code: string;
  fieldErrors?: Record<string, string[]>;
}

export function formatTRPCError(error: TRPCError): FormattedError {
  const result: FormattedError = {
    message: error.message,
    code: error.code,
  };

  if (error.cause instanceof ZodError) {
    const fieldErrors = error.cause.flatten().fieldErrors;
    const cleaned: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(fieldErrors)) {
      if (value && value.length > 0) {
        cleaned[key] = value;
      }
    }
    if (Object.keys(cleaned).length > 0) {
      result.fieldErrors = cleaned;
      const parts = Object.entries(cleaned).map(
        ([field, errors]) => `${field}: ${errors.join(", ")}`,
      );
      result.message = parts.join("; ");
    }
  }

  return result;
}
