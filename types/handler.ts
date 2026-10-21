import type { NextRequest } from "next/server";
import type { z } from "zod";

export type RouteParams = Record<string, string | string[]>;

export type InferBody<TSchema> = TSchema extends z.ZodType
  ? z.infer<TSchema>
  : undefined;

export type HandlerArgs<TBody = undefined, TParams = undefined> = {
  req: NextRequest;
} & (TBody extends undefined ? { body?: undefined } : { body: TBody }) &
  (TParams extends undefined ? { params?: RouteParams } : { params: TParams });

export type ApiOptions<TSchema extends z.ZodType | undefined> = {
  schema?: TSchema;
};
