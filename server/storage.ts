import { db } from "./db";
import { repositories, type Repository, type InsertRepository } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getRepositories(): Promise<Repository[]>;
  upsertRepository(repo: InsertRepository): Promise<Repository>;
  clearRepositories(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getRepositories(): Promise<Repository[]> {
    return await db.select().from(repositories);
  }

  async upsertRepository(insertRepo: InsertRepository): Promise<Repository> {
    const [existing] = await db
      .select()
      .from(repositories)
      .where(eq(repositories.githubId, insertRepo.githubId));

    if (existing) {
      const [updated] = await db
        .update(repositories)
        .set(insertRepo)
        .where(eq(repositories.githubId, insertRepo.githubId))
        .returning();
      return updated;
    }

    const [inserted] = await db
      .insert(repositories)
      .values(insertRepo)
      .returning();
    return inserted;
  }

  async clearRepositories(): Promise<void> {
    // Basic implementation for sync
  }
}

export const storage = new DatabaseStorage();
