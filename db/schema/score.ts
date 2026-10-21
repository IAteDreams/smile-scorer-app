import {
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import type { SmileScore } from "@/lib/scoring";
import { upload } from "./upload";
import { user } from "./user";

export type ScoreDetails = Omit<SmileScore, "score" | "label">;

export const score = pgTable(
  "score",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    uploadId: uuid("upload_id")
      .notNull()
      .unique()
      .references(() => upload.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    score: real("score").notNull(),
    label: text("label").notNull(),
    faceCount: integer("face_count").notNull(),
    details: jsonb("details").$type<ScoreDetails>().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("score_userId_createdAt_idx").on(table.userId, table.createdAt),
  ],
);
