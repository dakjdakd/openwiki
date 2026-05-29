interface FetchOptions {
  headers?: Record<string, string>;
  [key: string]: any;
}

/**
 * Thin wrapper around global fetch that injects GITHUB_TOKEN if present.
 */
export async function fetchGithub(url: string, options: FetchOptions = {}): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    ...options.headers,
  };
  const token = normalizeGithubToken(process.env.GITHUB_TOKEN);

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 && token) {
    console.warn('GitHub token was rejected. Retrying public GitHub request without authentication.');
    const { Authorization: _authorization, ...anonymousHeaders } = headers;
    return fetch(url, { ...options, headers: anonymousHeaders });
  }

  return response;
}

function normalizeGithubToken(value: string | undefined): string {
  return (value ?? '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/^(Bearer|token)\s+/i, '')
    .trim();
}

/**
 * Parse a GitHub repository URL and extract owner + repo.
 * Returns null if the URL is not a valid GitHub repository.
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ''),
  };
}
