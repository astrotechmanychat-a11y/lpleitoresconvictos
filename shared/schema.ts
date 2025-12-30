import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const repositories = pgTable("repositories", {
  id: serial("id").primaryKey(),
  githubId: text("github_id").notNull().unique(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  description: text("description"),
  htmlUrl: text("html_url").notNull(),
  language: text("language"),
  stargazersCount: text("stargazers_count"),
  updatedAt: timestamp("updated_at"),
});

export const insertRepositorySchema = createInsertSchema(repositories).omit({ id: true });

export type Repository = typeof repositories.$inferSelect;
export type InsertRepository = z.infer<typeof insertRepositorySchema>;

export type RepositoryResponse = Repository;
export type RepositoryListResponse = Repository[];
