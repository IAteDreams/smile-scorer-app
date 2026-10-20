import { defineRelations } from "drizzle-orm";
import * as schema from "@/db/schema";

export const relations = defineRelations(schema, (r) => ({
  user: {
    session: r.many.session(),
    account: r.many.account(),
    upload: r.many.upload(),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
  upload: {
    user: r.one.user({
      from: r.upload.userId,
      to: r.user.id,
    }),
  },
}));
