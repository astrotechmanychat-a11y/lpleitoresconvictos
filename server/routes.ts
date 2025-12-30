import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const GITHUB_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

  app.get(api.github.listRepos.path, async (req, res) => {
    try {
      if (!GITHUB_TOKEN) {
        return res.status(401).json({ message: "GitHub token not configured" });
      }

      const repos = await storage.getRepositories();
      res.json(repos);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.github.syncRepos.path, async (req, res) => {
    try {
      if (!GITHUB_TOKEN) {
        return res.status(401).json({ message: "GitHub token not configured" });
      }

      const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100", {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) {
        const err = await response.text();
        return res.status(response.status).json({ message: `GitHub API error: ${err}` });
      }

      const githubRepos = await response.json();
      let count = 0;

      for (const repo of githubRepos) {
        await storage.upsertRepository({
          githubId: String(repo.id),
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          htmlUrl: repo.html_url,
          language: repo.language,
          stargazersCount: String(repo.stargazers_count),
          updatedAt: repo.updated_at ? new Date(repo.updated_at) : null,
        });
        count++;
      }

      res.json({ message: "Sync complete", count });
    } catch (error) {
      console.error("Sync error:", error);
      res.status(500).json({ message: "Internal server error during sync" });
    }
  });

  app.get("/api/github/repo/:owner/:repo", async (req, res) => {
    try {
      if (!GITHUB_TOKEN) {
        return res.status(401).json({ message: "GitHub token not configured" });
      }

      const { owner, repo } = req.params;
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) {
        return res.status(response.status).json({ message: "Failed to fetch repo content" });
      }

      const contents = await response.json();
      res.json(contents);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
