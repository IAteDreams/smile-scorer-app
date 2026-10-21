import { APIError } from "better-auth/api";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { HttpError } from "@/lib/error";
import type {
  ApiOptions,
  HandlerArgs,
  InferBody,
  RouteParams,
} from "@/types/handler";
import type { ApiFailure, ApiSuccess } from "@/types/return";

const fail = (
  status: number,
  message: string,
  extra?: Omit<ApiFailure["error"], "message">,
) =>
  Response.json(
    { success: false, error: { message, ...extra } } satisfies ApiFailure,
    { status },
  );

export const apiWrapper = <
  TData,
  TSchema extends z.ZodType | undefined = undefined,
  TParams = undefined,
>(
  handler: (
    args: HandlerArgs<InferBody<TSchema>, TParams>,
  ) => Promise<TData> | TData,
  options: ApiOptions<TSchema> = {},
) => {
  const { schema } = options;

  return async (
    req: NextRequest,
    ctx?: { params: Promise<RouteParams> },
  ): Promise<Response> => {
    try {
      let body: unknown;
      if (schema) {
        const json = await req.json().catch(() => {
          throw new HttpError(400, "Invalid JSON body");
        });

        const parsed = schema.safeParse(json);

        if (!parsed.success) {
          return fail(422, "Validation failed", {
            issues: z.flattenError(parsed.error).fieldErrors as Record<
              string,
              string[] | undefined
            >,
          });
        }
        body = parsed.data;
      }

      const args = { req, params: await ctx?.params, body };
      const result = await handler(
        args as unknown as HandlerArgs<InferBody<TSchema>, TParams>,
      );

      if (result instanceof Response) return result;

      return Response.json({
        success: true,
        data: result ?? null,
      } satisfies ApiSuccess<TData | null>);
    } catch (error) {
      if (error instanceof HttpError) {
        return fail(error.status, error.message);
      }

      if (error instanceof APIError) {
        return fail(error.statusCode, error.body?.message ?? error.message, {
          code: error.body?.code,
        });
      }

      console.error("[api]", req.method, req.nextUrl.pathname, error);
      return fail(500, "Internal server error");
    }
  };
};
