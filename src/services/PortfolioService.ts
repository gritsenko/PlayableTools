import { injectable, ServiceLifetime } from "fw";

@injectable(ServiceLifetime.Singleton)
export class PortfolioService {
  private githubToken: string | null = null;

  /**
   * Set the GitHub personal access token for authorized API requests.
   * @param token GitHub personal access token
   */
  setGithubToken(token: string) {
    this.githubToken = token;
  }
  /**
   * Given a GitHub repo URL, fetches the list of playable ads (folders/files) in the repo.
   * For demo, returns stub data. Replace with real GitHub API logic as needed.
   */
  async getPlayables(repoUrl: string): Promise<string[]> {
    // TODO: Use GitHub API to fetch folder structure and list playable ads
    // For now, return stub data
    return [
      "Playable 1 (stub)",
      "Playable 2 (stub)",
      "Playable 3 (stub)"
    ];
  }
}
